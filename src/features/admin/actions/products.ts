'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { after } from 'next/server';
import { AppwriteException } from 'node-appwrite';

import { uuid } from '@/features/admin/schemas/common';
import { productCreateSchema, productUpdateSchema } from '@/features/admin/schemas/product';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import type { ProductFormData } from '@/features/admin/types';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { slugify } from '@/features/admin/utils/slugify';
import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import {
  bulkDeleteProductsWithRelations,
  bulkSetProductActive,
  createProductWithTaxonomy,
  getCategorySlugById,
  getNextProductOrder,
  getProductCategorySlug,
  getProductImageUrls,
  reorderProductsAppwrite,
  setProductActive,
  updateProductWithTaxonomy,
} from '@/lib/appwrite/repositories/products';
import { getRepositoryContext } from '@/lib/appwrite/repositories/shared';
import {
  ensureColorsAppwrite,
  ensureFlowerTypesAppwrite,
} from '@/lib/appwrite/repositories/taxonomy';
import { imageStorage } from '@/lib/imageStorage';
import { BASE_REVALIDATE_PATHS } from '@/lib/revalidation';
interface SuccessResult {
  cleanupWarning?: string;
  success: true;
}
type ProductActionResult = SuccessResult | AdminActionFailure;

async function validateImageUrls(data: ProductFormData): Promise<AdminActionFailure | null> {
  if (!imageStorage.isOwnedUrl(data.imageUrl)) {
    return { success: false, error: 'URL de imagen no permitida.', code: 'VALIDATION' };
  }
  for (const url of data.images) {
    if (!imageStorage.isOwnedUrl(url)) {
      return { success: false, error: 'Una de las imágenes adicionales tiene una URL no permitida.', code: 'VALIDATION' };
    }
  }
  return null;
}

async function revalidateProductPaths(
  slug?: string,
  categoryId?: string,
  knownCategorySlug?: string | null,
): Promise<void> {
  BASE_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
  updateTag('catalog-products');
  updateTag('catalog-categories');

  const categorySlug = knownCategorySlug ?? (categoryId
    ? await getCategorySlugById(categoryId)
    : null);
  if (categorySlug) {
    revalidatePath(`/catalogo/${categorySlug}`);
    if (slug) revalidatePath(`/catalogo/${categorySlug}/${slug}`);
  }
}

async function cleanUpDeletedProductImages(imageUrls: string[]): Promise<string | undefined> {
  if (imageUrls.length === 0) return undefined;

  try {
    await imageStorage.deleteMany(imageUrls);
    return undefined;
  } catch (error) {
    console.error('[products] storage cleanup failed after committed deletion', {
      error: error instanceof Error ? error.message : error,
    });
    return 'Los productos se eliminaron, pero no se pudieron limpiar algunas imágenes.';
  }
}

async function getAppwriteProductSlug(productId: string): Promise<string | null> {
  try {
    const { databases, databaseId } = getRepositoryContext();
    const doc = await databases.getDocument({
      databaseId,
      collectionId: APPWRITE_COLLECTIONS.products,
      documentId: productId,
    });
    return (doc as unknown as { slug: string }).slug;
  } catch {
    return null;
  }
}

export async function createProduct(data: ProductFormData): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const parsed = productCreateSchema.safeParse(data);
    if (!parsed.success) {
      after(() => console.warn('[createProduct] validation failed:', parsed.error.issues));
      return { success: false, error: 'Datos inválidos. Revisa el formulario.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const formData = parsed.data as ProductFormData;
    const urlError = await validateImageUrls(formData);
    if (urlError) return urlError;

    const slug = formData.slug?.trim() || slugify(formData.name);

    const [, nextOrder] = await Promise.all([
      Promise.all([
        formData.newFlowerTypes?.length
          ? ensureFlowerTypesAppwrite(formData.newFlowerTypes)
          : Promise.resolve(),
        formData.newColors?.length
          ? ensureColorsAppwrite(formData.newColors)
          : Promise.resolve(),
      ]),
      formData.displayOrder ? Promise.resolve(formData.displayOrder) : getNextProductOrder(),
    ]);
    try {
      await createProductWithTaxonomy({
        name: formData.name,
        slug,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl,
        includes: formData.includes,
        priceVariants: formData.priceVariants,
        occasion: formData.occasion || null,
        note: formData.note || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        displayOrder: nextOrder,
      }, {
        productName: formData.name,
        colorNames: formData.colors,
        flowerTypeNames: formData.flowerTypes,
        imageUrl: formData.imageUrl,
        galleryImages: formData.images,
        imageAlts: formData.imageAlts,
      });
    } catch (writeErr) {
      if (writeErr instanceof AppwriteException && writeErr.code === 409) {
        return { success: false, error: 'Ya existe un registro con esos datos.', code: 'INTERNAL' };
      }
      throw writeErr;
    }


    await revalidateProductPaths(slug, formData.categoryId);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }

    const parsed = productUpdateSchema.safeParse(data);
    if (!parsed.success) {
      after(() => console.warn('[updateProduct] validation failed:', parsed.error.issues));
      return { success: false, error: 'Datos inválidos. Revisa el formulario.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const formData = parsed.data as ProductFormData;
    const urlError = await validateImageUrls(formData);
    if (urlError) return urlError;

    const [, meta, currentSlug, currentImageUrls] = await Promise.all([
      Promise.all([
        formData.newFlowerTypes?.length
          ? ensureFlowerTypesAppwrite(formData.newFlowerTypes)
          : Promise.resolve(),
        formData.newColors?.length
          ? ensureColorsAppwrite(formData.newColors)
          : Promise.resolve(),
      ]),
      getProductCategorySlug(idParsed.data),
      getAppwriteProductSlug(idParsed.data),
      getProductImageUrls(idParsed.data),
    ]);

    const incomingSlug = formData.slug?.trim() ?? '';
    const slug =
      incomingSlug && incomingSlug !== currentSlug
        ? incomingSlug
        : (currentSlug ?? slugify(formData.name));

    try {
      await updateProductWithTaxonomy(idParsed.data, {
        name: formData.name,
        slug,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl,
        includes: formData.includes,
        priceVariants: formData.priceVariants,
        occasion: formData.occasion || null,
        note: formData.note || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        displayOrder: formData.displayOrder,
      }, {
        productName: formData.name,
        colorNames: formData.colors,
        flowerTypeNames: formData.flowerTypes,
        imageUrl: formData.imageUrl,
        galleryImages: formData.images,
        imageAlts: formData.imageAlts,
      });
    } catch (writeErr) {
      if (writeErr instanceof AppwriteException && writeErr.code === 409) {
        return { success: false, error: 'Ya existe un registro con esos datos.', code: 'INTERNAL' };
      }
      throw writeErr;
    }

    const newUrls = new Set([formData.imageUrl, ...formData.images]);
    const removed = currentImageUrls.filter((url) => !newUrls.has(url));
    if (removed.length > 0) void imageStorage.deleteMany(removed);


    const resolvedCategoryId = formData.categoryId ?? meta?.categoryId;
    await revalidateProductPaths(slug, resolvedCategoryId);

    const slugChanged = currentSlug && currentSlug !== slug;
    const categoryChanged = meta?.categoryId && meta.categoryId !== resolvedCategoryId;
    if (slugChanged || categoryChanged) {
      await revalidateProductPaths(currentSlug ?? undefined, meta?.categoryId);
    }

    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }

    const [deletedProduct] = await bulkDeleteProductsWithRelations([idParsed.data]);
    if (!deletedProduct) {
      return { success: false, error: 'El producto ya no existe.', code: 'VALIDATION' };
    }

    const cleanupWarning = await cleanUpDeletedProductImages(deletedProduct.imageUrls);
    await revalidateProductPaths(
      deletedProduct.slug,
      deletedProduct.categoryId,
      deletedProduct.categorySlug,
    );
    return { success: true, cleanupWarning };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function bulkSetProductStatus(
  ids: string[],
  isActive: boolean,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success || typeof isActive !== 'boolean') {
      return { success: false, error: 'Productos o estado inválidos.', code: 'VALIDATION' };
    }
    await bulkSetProductActive(parsed.data.ids, isActive);
    BASE_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
    updateTag('catalog-products');
    updateTag('catalog-categories');
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function bulkDeleteProducts(ids: string[]): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de productos inválida.', code: 'VALIDATION' };
    }
    const deletedProducts = await bulkDeleteProductsWithRelations(parsed.data.ids);
    const cleanupWarning = await cleanUpDeletedProductImages(
      [...new Set(deletedProducts.flatMap((product) => product.imageUrls))],
    );
    await Promise.all(deletedProducts.map((product) =>
      revalidateProductPaths(product.slug, product.categoryId, product.categorySlug),
    ));
    return { success: true, cleanupWarning };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderProducts(ids: string[]): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de productos inválida.', code: 'VALIDATION' };
    }
    await reorderProductsAppwrite(parsed.data.ids);
    BASE_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
    updateTag('catalog-products');
    updateTag('catalog-categories');
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleProductStatus(
  id: string,
  isActive: boolean,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
    }

    const meta = await getProductCategorySlug(idParsed.data);
    await setProductActive(idParsed.data, isActive);
    const slug = await getAppwriteProductSlug(idParsed.data);
    await revalidateProductPaths(slug ?? undefined, meta?.categoryId);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

