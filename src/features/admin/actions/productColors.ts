'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteColorSchema,
  renameColorSchema,
} from '@/features/admin/schemas/color';
import {
  type AdminActionFailure,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';

interface SuccessResult {
  success: true;
}
type ColorActionResult = SuccessResult | AdminActionFailure;

export async function deleteProductColor(name: string): Promise<ColorActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const parsed = deleteColorSchema.safeParse({ name });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Nombre inválido.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { error } = await supabase.rpc('delete_product_color', {
      p_name: parsed.data.name,
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

export async function renameProductColor(
  oldName: string,
  newName: string,
): Promise<ColorActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const parsed = renameColorSchema.safeParse({ oldName, newName });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos para renombrar.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { error } = await supabase.rpc('rename_product_color', {
      p_old_name: parsed.data.oldName,
      p_new_name: parsed.data.newName.toLowerCase().trim(),
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
