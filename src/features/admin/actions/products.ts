'use server';

import { revalidatePath } from 'next/cache';

import { uuid } from '@/features/admin/schemas/common';
import { productCreateSchema, productUpdateSchema } from '@/features/admin/schemas/product';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import type { ProductFormData } from '@/features/admin/types';
import {
  type AdminActionFailure,
  type AdminSupabaseClient,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { isAllowedCloudinaryUrl } from '@/features/admin/utils/cloudinaryUrl';
import { slugify } from '@/features/admin/utils/slugify';
import { syncTaxonomy } from '@/features/admin/utils/taxonomySync';
import { destroyCloudinaryImages } from '@/lib/cloudinary';
import type { Database, Json } from '@/lib/supabase/types';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

interface SuccessResult {
  success: true;
}
type ProductActionResult = SuccessResult | AdminActionFailure;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/**
 * Scalar product fields only.
 * image_url is still written (NOT NULL constraint remains until Phase D drops it).
 * Old array columns (colors, flower_types, images) are NOT written — taxonomy is
 * managed exclusively via set_product_taxonomy RPC from Phase C onward.
 */
function toInsertPayload(data: ProductFormData, slug: string): ProductInsert {
  return {
    name: data.name,
    slug,
    description: data.description,
    price: data.price,
    category_id: data.categoryId,
    image_url: data.imageUrl,
    includes: data.includes as unknown as Json,
    price_variants: data.priceVariants as Json | null,
    occasion: data.occasion || null,
    note: data.note || null,
    is_active: data.isActive,
    is_featured: data.isFeatured,
    display_order: data.displayOrder,
  };
}

async function validateImageUrls(data: ProductFormData): Promise<AdminActionFailure | null> {
  if (!isAllowedCloudinaryUrl(data.imageUrl)) {
    return { success: false, error: 'URL de imagen no permitida.', code: 'VALIDATION' };
  }
  for (const url of data.images) {
    if (!isAllowedCloudinaryUrl(url)) {
      return { success: false, error: 'Una de las imágenes adicionales tiene una URL no permitida.', code: 'VALIDATION' };
    }
  }
  return null;
}

async function revalidateProductPaths(
  supabase: AdminSupabaseClient,
  slug?: string,
  categoryId?: string,
): Promise<void> {
  revalidatePath('/');
  revalidatePath('/catalogo');

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

  revalidatePath('/admin/productos');
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createProduct(data: ProductFormData): Promise<ProductActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = productCreateSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[createProduct] validation failed:', parsed.error.issues);
      return { success: false, error: 'Datos inválidos. Revisá el formulario.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const formData = parsed.data as ProductFormData;
    const urlError = await validateImageUrls(formData);
    if (urlError) return urlError;

    const { supabase } = ctx;

    if (formData.newFlowerTypes?.length) await ensureFlowerTypes(supabase, formData.newFlowerTypes);
    if (formData.newColors?.length) await ensureColors(supabase, formData.newColors);

    const slug = formData.slug?.trim() || slugify(formData.name);
    const payload = toInsertPayload(formData, slug);

    const { data: inserted, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single();

    if (error || !inserted) {
      return { success: false, error: describeSupabaseError(error ?? {}), code: 'INTERNAL' };
    }

    const syncError = await syncTaxonomy(supabase, {
      productId: inserted.id,
      productName: formData.name,
      colorNames: formData.colors,
      flowerTypeNames: formData.flowerTypes,
      imageUrl: formData.imageUrl,
      galleryImages: formData.images,
    });
    if (syncError) {
      return { success: false, error: syncError.error.message, code: 'INTERNAL' };
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
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }

    const parsed = productUpdateSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[updateProduct] validation failed:', parsed.error.issues);
      return { success: false, error: 'Datos inválidos. Revisá el formulario.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const formData = parsed.data as ProductFormData;
    const urlError = await validateImageUrls(formData);
    if (urlError) return urlError;

    const { supabase } = ctx;

    if (formData.newFlowerTypes?.length) await ensureFlowerTypes(supabase, formData.newFlowerTypes);
    if (formData.newColors?.length) await ensureColors(supabase, formData.newColors);

    // Fetch current slug + existing images for Cloudinary cleanup
    const { data: current } = await supabase
      .from('products')
      .select('slug, category_id')
      .eq('id', idParsed.data)
      .single();

    const { data: currentImages } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', idParsed.data);

    const incomingSlug = formData.slug?.trim() ?? '';
    const slug =
      incomingSlug && incomingSlug !== current?.slug
        ? incomingSlug
        : (current?.slug ?? slugify(formData.name));

    const payload = toInsertPayload(formData, slug);

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', idParsed.data);

    if (error) {
      return { success: false, error: describeSupabaseError(error), code: 'INTERNAL' };
    }

    // Cloudinary cleanup — best-effort for removed images
    if (currentImages) {
      const newUrls = new Set([formData.imageUrl, ...formData.images]);
      const removed = (currentImages).filter((r) => !newUrls.has(r.url)).map((r) => r.url);
      if (removed.length > 0) void destroyCloudinaryImages(removed);
    }

    const syncError = await syncTaxonomy(supabase, {
      productId: idParsed.data,
      productName: formData.name,
      colorNames: formData.colors,
      flowerTypeNames: formData.flowerTypes,
      imageUrl: formData.imageUrl,
      galleryImages: formData.images,
    });
    if (syncError) {
      return { success: false, error: syncError.error.message, code: 'INTERNAL' };
    }

    await revalidateProductPaths(supabase, slug, formData.categoryId ?? current?.category_id);
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
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }

    const { supabase } = ctx;

    // Fetch images from product_images (relational source) + product meta before deleting
    const { data: product } = await supabase
      .from('products')
      .select('category_id, slug')
      .eq('id', idParsed.data)
      .single();

    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', idParsed.data);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', idParsed.data);

    if (error) {
      return { success: false, error: describeSupabaseError(error), code: 'INTERNAL' };
    }

    // Cloudinary cleanup — best-effort (product row is already gone, junctions cascaded)
    if (images?.length) {
      void destroyCloudinaryImages(images.map((r) => r.url));
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
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
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
      return { success: false, error: describeSupabaseError(error), code: 'INTERNAL' };
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
      return { success: false, error: 'Lista de identificadores inválida.', code: 'VALIDATION', issues: parsed.error.issues };
    }

    const { supabase } = ctx;
    const { error } = await supabase.rpc('reorder_products', {
      p_ordered_ids: parsed.data.ids,
    });

    if (error) {
      return { success: false, error: describeSupabaseError(error), code: 'INTERNAL' };
    }

    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
