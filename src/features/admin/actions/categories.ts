'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { CategoryFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';

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

    const slug = data.slug.trim() !== '' ? data.slug : slugify(data.name);
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
    const slug = data.slug.trim() !== '' ? data.slug : slugify(data.name);
    const payload = toInsertPayload(data, slug);

    const { error } = await supabase.from('categories').update(payload).eq('id', id);

    if (error) return { success: false, error: error.message };

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

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
