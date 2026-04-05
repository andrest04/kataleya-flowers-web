'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import { destroyCloudinaryImage, destroyCloudinaryImages } from '@/lib/cloudinary';

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function ensureColors(supabase: SupabaseClient, colors: { name: string; hex: string }[]) {
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
    { onConflict: 'name', ignoreDuplicates: true }
  );
}

async function ensureFlowerTypes(supabase: SupabaseClient, names: string[]) {
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
    { onConflict: 'name', ignoreDuplicates: true }
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

export async function createProduct(
  data: ProductFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    if (data.newFlowerTypes?.length) {
      await ensureFlowerTypes(supabase, data.newFlowerTypes);
    }
    if (data.newColors?.length) {
      await ensureColors(supabase, data.newColors);
    }

    const slug = slugify(data.name);
    const payload = toInsertPayload(data, slug);

    const { error } = await supabase
      .from('products')
      .insert(payload);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    revalidatePath('/admin/tipos-de-flor');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    if (data.newFlowerTypes?.length) {
      await ensureFlowerTypes(supabase, data.newFlowerTypes);
    }
    if (data.newColors?.length) {
      await ensureColors(supabase, data.newColors);
    }

    // Fetch current images to detect replacements
    const { data: current } = await supabase
      .from('products')
      .select('image_url, images')
      .eq('id', id)
      .single();

    const slug = slugify(data.name);
    const payload = toInsertPayload(data, slug);

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    // Cleanup replaced images from Cloudinary (best-effort, after successful update)
    if (current) {
      if (current.image_url && current.image_url !== data.imageUrl) {
        void destroyCloudinaryImage(current.image_url);
      }
      const oldImages = (current.images as string[]) ?? [];
      const removed = oldImages.filter((url) => !data.images.includes(url));
      if (removed.length > 0) void destroyCloudinaryImages(removed);
    }

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch images before deleting the row
    const { data: product } = await supabase
      .from('products')
      .select('image_url, images')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    // Cleanup images from Cloudinary (best-effort, after successful delete)
    if (product) {
      const allUrls = [product.image_url, ...((product.images as string[]) ?? [])];
      void destroyCloudinaryImages(allUrls);
    }

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function toggleProductStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function reorderProducts(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('reorder_products', {
      p_ordered_ids: orderedIds,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
