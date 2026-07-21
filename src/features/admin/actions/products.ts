'use server';

import { revalidatePath } from 'next/cache';
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
  createProductDocument,
  deleteProductDocument,
  deleteProductRelations,
  getCategorySlugById,
  getCategorySlugsForProducts,
  getNextProductOrder,
  getProductCategorySlug,
  getProductImageUrls,
  reorderProductDocuments,
  setProductActive,
  syncProductTaxonomyAppwrite,
  updateProductDocument,
} from '@/lib/appwrite/repositories/products';
import { getRepositoryContext } from '@/lib/appwrite/repositories/shared';
import {
  ensureColorsAppwrite,
  ensureFlowerTypesAppwrite,
} from '@/lib/appwrite/repositories/taxonomy';
import { imageStorage } from '@/lib/imageStorage';
interface SuccessResult {
  success: true;
}
type ProductActionResult = SuccessResult | AdminActionFailure;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
): Promise<void> {
  revalidatePath('/');
  revalidatePath('/catalogo');

  if (categoryId) {
    const categorySlug = await getCategorySlugById(categoryId);
    if (categorySlug) {
      revalidatePath(`/catalogo/${categorySlug}`);
      if (slug) revalidatePath(`/catalogo/${categorySlug}/${slug}`);
    }
  }

  revalidatePath('/admin/productos');
}

/** Fetches the slug of a product from Appwrite, returns null if not found. */
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

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createProduct(data: ProductFormData): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const parsed = productCreateSchema.safeParse(data);
    if (!parsed.success) {
      after(() => console.warn('[createProduct] validation failed:', parsed.error.issues));
      return { success: false, error: 'Datos inválidos. Revisá el formulario.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const formData = parsed.data as ProductFormData;
    const urlError = await validateImageUrls(formData);
    if (urlError) return urlError;

    const slug = formData.slug?.trim() || slugify(formData.name);

    if (formData.newFlowerTypes?.length) await ensureFlowerTypesAppwrite(formData.newFlowerTypes);
    if (formData.newColors?.length) await ensureColorsAppwrite(formData.newColors);

    const nextOrder = formData.displayOrder || (await getNextProductOrder());
    let productId: string;
    try {
      productId = await createProductDocument({
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
      });
    } catch (writeErr) {
      if (writeErr instanceof AppwriteException && writeErr.code === 409) {
        return { success: false, error: 'Ya existe un registro con esos datos.', code: 'INTERNAL' };
      }
      throw writeErr;
    }

    const syncErr = await syncProductTaxonomyAppwrite({
      productId,
      productName: formData.name,
      colorNames: formData.colors,
      flowerTypeNames: formData.flowerTypes,
      imageUrl: formData.imageUrl,
      galleryImages: formData.images,
    });
    if (syncErr) {
      return { success: false, error: syncErr.message, code: 'INTERNAL' };
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
      return { success: false, error: 'Datos inválidos. Revisá el formulario.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const formData = parsed.data as ProductFormData;
    const urlError = await validateImageUrls(formData);
    if (urlError) return urlError;

    if (formData.newFlowerTypes?.length) await ensureFlowerTypesAppwrite(formData.newFlowerTypes);
    if (formData.newColors?.length) await ensureColorsAppwrite(formData.newColors);

    const [meta, currentSlug, currentImageUrls] = await Promise.all([
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
      await updateProductDocument(idParsed.data, {
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
      });
    } catch (writeErr) {
      if (writeErr instanceof AppwriteException && writeErr.code === 409) {
        return { success: false, error: 'Ya existe un registro con esos datos.', code: 'INTERNAL' };
      }
      throw writeErr;
    }

    // Storage cleanup — best-effort for removed images
    const newUrls = new Set([formData.imageUrl, ...formData.images]);
    const removed = currentImageUrls.filter((url) => !newUrls.has(url));
    if (removed.length > 0) void imageStorage.deleteMany(removed);

    const syncErr = await syncProductTaxonomyAppwrite({
      productId: idParsed.data,
      productName: formData.name,
      colorNames: formData.colors,
      flowerTypeNames: formData.flowerTypes,
      imageUrl: formData.imageUrl,
      galleryImages: formData.images,
    });
    if (syncErr) {
      return { success: false, error: syncErr.message, code: 'INTERNAL' };
    }

    const resolvedCategoryId = formData.categoryId ?? meta?.categoryId;
    await revalidateProductPaths(slug, resolvedCategoryId);

    // Revalidate OLD paths if slug or category changed
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

    const meta = await getProductCategorySlug(idParsed.data);
    const productSlug = await getAppwriteProductSlug(idParsed.data);
    const imageUrls = await getProductImageUrls(idParsed.data);

    await deleteProductRelations(idParsed.data);
    await deleteProductDocument(idParsed.data);

    if (imageUrls.length > 0) void imageStorage.deleteMany(imageUrls);

    await revalidateProductPaths(productSlug ?? undefined, meta?.categoryId);
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

export async function reorderProducts(orderedIds: string[]): Promise<ProductActionResult> {
  try {
    await requireAdmin();

    const parsed = reorderSchema.safeParse({ ids: orderedIds });
    if (!parsed.success) {
      return { success: false, error: 'Lista de identificadores inválida.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    await reorderProductDocuments(parsed.data.ids);

    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');

    const slugMap = await getCategorySlugsForProducts(parsed.data.ids);
    for (const categorySlug of slugMap.values()) {
      if (categorySlug) revalidatePath(`/catalogo/${categorySlug}`);
    }

    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
