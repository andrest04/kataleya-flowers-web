'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { CategoryFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import { destroyCloudinaryImage, destroyCloudinaryImages } from '@/lib/cloudinary';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

function toInsertPayload(data: CategoryFormData, slug: string): CategoryInsert {
  return {
    name: data.name,
    slug,
    description: data.description,
    occasion: data.occasion || null,
    image_url: data.imageUrl || null,
    display_order: data.displayOrder,
    is_active: data.isActive,
    is_featured: data.isFeatured,
  };
}

export async function createCategory(
  data: CategoryFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Auto-assign next display order
    const { data: all } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (all && all.length > 0) ? all[0].display_order + 1 : 1;

    const slug = slugify(data.name);
    const payload = toInsertPayload({ ...data, displayOrder: nextOrder }, slug);

    const { error } = await supabase.from('categories').insert(payload);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch current image to detect replacement
    const { data: current } = await supabase
      .from('categories')
      .select('image_url')
      .eq('id', id)
      .single();

    const slug = slugify(data.name);
    const payload = toInsertPayload(data, slug);

    const { error } = await supabase.from('categories').update(payload).eq('id', id);

    if (error) return { success: false, error: error.message };

    // Cleanup replaced image from Cloudinary (best-effort)
    if (current?.image_url && current.image_url !== data.imageUrl) {
      void destroyCloudinaryImage(current.image_url);
    }

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const updates = orderedIds.map((id, index) =>
      supabase
        .from('categories')
        .update({ display_order: index + 1 })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) return { success: false, error: failed.error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function getCategoryProductCount(
  categoryId: string
): Promise<{ count: number; error?: string }> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) return { count: 0, error: error.message };
    return { count: count ?? 0 };
  } catch (err) {
    return { count: 0, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function deleteCategory(
  id: string,
  mode: 'reassign' | 'cascade',
  reassignTo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Count products in this category
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    const productCount = count ?? 0;

    if (productCount > 0 && mode === 'reassign' && !reassignTo) {
      return {
        success: false,
        error: 'Seleccioná una categoría destino para reasignar los productos.',
      };
    }

    // Reassign products before deleting
    if (productCount > 0 && mode === 'reassign' && reassignTo) {
      const { error: reassignError } = await supabase
        .from('products')
        .update({ category_id: reassignTo })
        .eq('category_id', id);

      if (reassignError) return { success: false, error: reassignError.message };
    }

    // Cascade: delete all products (and their Cloudinary images)
    if (productCount > 0 && mode === 'cascade') {
      const { data: products } = await supabase
        .from('products')
        .select('image_url, images')
        .eq('category_id', id);

      const { error: deleteProductsError } = await supabase
        .from('products')
        .delete()
        .eq('category_id', id);

      if (deleteProductsError) return { success: false, error: deleteProductsError.message };

      // Cleanup product images from Cloudinary (best-effort)
      if (products) {
        const allUrls = products.flatMap((p) => [
          p.image_url,
          ...((p.images as string[]) ?? []),
        ]);
        void destroyCloudinaryImages(allUrls);
      }
    }

    // Fetch category image before deleting the row
    const { data: category } = await supabase
      .from('categories')
      .select('image_url')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) return { success: false, error: error.message };

    // Cleanup category image from Cloudinary (best-effort)
    if (category?.image_url) {
      void destroyCloudinaryImage(category.image_url);
    }

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function toggleCategoryFeatured(
  id: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('categories')
      .update({ is_featured: isFeatured })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
