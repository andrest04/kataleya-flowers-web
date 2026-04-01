'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

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
    const slug = data.slug.trim() !== '' ? data.slug : slugify(data.name);
    const payload = toInsertPayload(data, slug);

    const { error } = await supabase
      .from('products')
      .insert(payload);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
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
    const slug = data.slug.trim() !== '' ? data.slug : slugify(data.name);
    const payload = toInsertPayload(data, slug);

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) return { success: false, error: error.message };

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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
