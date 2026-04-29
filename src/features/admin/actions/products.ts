'use server';

import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import { destroyCloudinaryImage, destroyCloudinaryImages } from '@/lib/cloudinary';
import {
  type AdminActionFailure,
  type AdminSupabaseClient,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { isAllowedCloudinaryUrl } from '@/features/admin/utils/cloudinaryUrl';
import { productCreateSchema, productUpdateSchema } from '@/features/admin/schemas/product';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import { uuid } from '@/features/admin/schemas/common';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

interface SuccessResult {
  success: true;
}
type ProductActionResult = SuccessResult | AdminActionFailure;

// ─── Helpers internos ────────────────────────────────────────────────────────

async function ensureColors(
  supabase: AdminSupabaseClient,
  colors: { name: string; hex: string }[],
) {
  if (colors.length === 0) return;
  const { data: existing } = await supabase
    .from('product_colors')
    .select('name, display_order')
    .order('display_order', { ascending: false })
    .limit(1);
  const nextOrder = (existing?.length ? existing[0].display_order : 0) + 1;

  await supabase.from('product_colors').upsert(
    colors.map((c, i) => ({
      name: c.name.toLowerCase().trim(),
      label: c.name.charAt(0).toUpperCase() + c.name.slice(1).toLowerCase().trim(),
      hex: c.hex || null,
      display_order: nextOrder + i,
    })),
    { onConflict: 'name', ignoreDuplicates: true },
  );
}

async function ensureFlowerTypes(supabase: AdminSupabaseClient, names: string[]) {
  if (names.length === 0) return;
  const { data: existing } = await supabase
    .from('flower_types')
    .select('name, display_order')
    .order('display_order', { ascending: false })
    .limit(1);
  const nextOrder = (existing?.length ? existing[0].display_order : 0) + 1;

  await supabase.from('flower_types').upsert(
    names.map((name, i) => ({
      name: name.toLowerCase().trim(),
      display_order: nextOrder + i,
    })),
    { onConflict: 'name', ignoreDuplicates: true },
  );
}

function toInsertPayload(data: ProductFormData, slug: string): ProductInsert {
  return {
    name: data.name,
    slug,
    description: data.description,
    price: data.price,
    category_id: data.categoryId,
    image_url: data.imageUrl,
    images: data.images,
    colors: data.colors,
    flower_types: data.flowerTypes,
    includes: data.includes,
    price_variants: data.priceVariants,
    occasion: data.occasion || null,
    note: data.note || null,
    is_active: data.isActive,
    is_featured: data.isFeatured,
    display_order: data.displayOrder,
  };
}

async function revalidateProductPaths(
  supabase: AdminSupabaseClient,
  slug?: string,
  categoryId?: string,
): Promise<void> {
  // Catálogo público
  revalidatePath('/');
  revalidatePath('/catalogo');

  // Detalle si tenemos categoría
  if (categoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', categoryId)
      .single();
    if (category?.slug) {
      revalidatePath(`/catalogo/${category.slug}`);
      if (slug) revalidatePath(`/catalogo/${category.slug}/${slug}`);
    }
  }

  // Admin
  revalidatePath('/admin/productos');
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createProduct(data: ProductFormData): Promise<ProductActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = productCreateSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[createProduct] validation failed:', parsed.error.issues);
      return {
        success: false,
        error: 'Datos inválidos. Revisá el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    // Defense-in-depth: validar URLs de imagen a nivel de allowlist
    if (!isAllowedCloudinaryUrl(parsed.data.imageUrl)) {
      return {
        success: false,
        error: 'URL de imagen no permitida.',
        code: 'VALIDATION',
      };
    }
    for (const url of parsed.data.images) {
      if (!isAllowedCloudinaryUrl(url)) {
        return {
          success: false,
          error: 'Una de las imágenes adicionales tiene una URL no permitida.',
          code: 'VALIDATION',
        };
      }
    }

    const { supabase } = ctx;
    const formData = parsed.data as ProductFormData;

    if (formData.newFlowerTypes?.length) {
      await ensureFlowerTypes(supabase, formData.newFlowerTypes);
    }
    if (formData.newColors?.length) {
      await ensureColors(supabase, formData.newColors);
    }

    const slug = formData.slug?.trim() || slugify(formData.name);
    const payload = toInsertPayload(formData, slug);

    const { error } = await supabase.from('products').insert(payload);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    await revalidateProductPaths(supabase, slug, formData.categoryId);
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
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }

    const parsed = productUpdateSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[updateProduct] validation failed:', parsed.error.issues);
      return {
        success: false,
        error: 'Datos inválidos. Revisá el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (!isAllowedCloudinaryUrl(parsed.data.imageUrl)) {
      return {
        success: false,
        error: 'URL de imagen no permitida.',
        code: 'VALIDATION',
      };
    }
    for (const url of parsed.data.images) {
      if (!isAllowedCloudinaryUrl(url)) {
        return {
          success: false,
          error: 'Una de las imágenes adicionales tiene una URL no permitida.',
          code: 'VALIDATION',
        };
      }
    }

    const { supabase } = ctx;
    const formData = parsed.data as ProductFormData;

    if (formData.newFlowerTypes?.length) {
      await ensureFlowerTypes(supabase, formData.newFlowerTypes);
    }
    if (formData.newColors?.length) {
      await ensureColors(supabase, formData.newColors);
    }

    // Fetch current images to detect replacements
    const { data: current } = await supabase
      .from('products')
      .select('image_url, images')
      .eq('id', idParsed.data)
      .single();

    const slug = formData.slug?.trim() || slugify(formData.name);
    const payload = toInsertPayload(formData, slug);

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    // Cleanup replaced images from Cloudinary (best-effort)
    if (current) {
      if (current.image_url && current.image_url !== formData.imageUrl) {
        void destroyCloudinaryImage(current.image_url);
      }
      const oldImages = (current.images as string[] | null) ?? [];
      const removed = oldImages.filter((url) => !formData.images.includes(url));
      if (removed.length > 0) void destroyCloudinaryImages(removed);
    }

    await revalidateProductPaths(supabase, slug, formData.categoryId);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  try {
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }

    const { supabase } = ctx;

    // Fetch images and category before deleting the row
    const { data: product } = await supabase
      .from('products')
      .select('image_url, images, category_id, slug')
      .eq('id', idParsed.data)
      .single();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    // Cleanup images from Cloudinary (best-effort)
    if (product) {
      const allUrls = [
        product.image_url,
        ...(((product.images as string[] | null) ?? []) as string[]),
      ];
      void destroyCloudinaryImages(allUrls);
    }

    await revalidateProductPaths(supabase, product?.slug, product?.category_id);
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
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (typeof isActive !== 'boolean') {
      return {
        success: false,
        error: 'Estado inválido.',
        code: 'VALIDATION',
      };
    }

    const { supabase } = ctx;

    const { data: product } = await supabase
      .from('products')
      .select('category_id, slug')
      .eq('id', idParsed.data)
      .single();

    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    await revalidateProductPaths(supabase, product?.slug, product?.category_id);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderProducts(orderedIds: string[]): Promise<ProductActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = reorderSchema.safeParse({ ids: orderedIds });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Lista de identificadores inválida.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { supabase } = ctx;
    const { error } = await supabase.rpc('reorder_products', {
      p_ordered_ids: parsed.data.ids,
    });

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
