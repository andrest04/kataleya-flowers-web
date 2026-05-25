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

    const { error } = await supabase
      .from('product_colors')
      .delete()
      .eq('name', parsed.data.name);

    if (error) {
      // 23503 = FK RESTRICT violation — color is assigned to one or more products
      if (error.code === '23503') {
        return {
          success: false,
          error: 'Este color está en uso por uno o más productos y no puede eliminarse.',
          code: 'COLOR_IN_USE',
        };
      }
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

    const normalizedNew = parsed.data.newName.toLowerCase().trim();

    const { error } = await supabase
      .from('product_colors')
      .update({ name: normalizedNew })
      .eq('name', parsed.data.oldName);

    if (error) {
      // 23505 = UNIQUE violation — the new name already exists
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Ya existe un color con ese nombre.',
          code: 'INTERNAL',
        };
      }
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
