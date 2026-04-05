'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function deleteProductColor(
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('delete_product_color', { p_name: name });

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function renameProductColor(
  oldName: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('rename_product_color', {
      p_old_name: oldName,
      p_new_name: newName.toLowerCase().trim(),
    });

    if (error) return { success: false, error: error.message };

    revalidatePath('/catalogo');
    revalidatePath('/admin/productos');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
