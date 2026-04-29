'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteFlowerTypeSchema,
  renameFlowerTypeSchema,
} from '@/features/admin/schemas/flowerType';
import {
  type AdminActionFailure,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';

interface SuccessResult {
  success: true;
}
type FlowerTypeActionResult = SuccessResult | AdminActionFailure;

export async function deleteFlowerType(name: string): Promise<FlowerTypeActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const parsed = deleteFlowerTypeSchema.safeParse({ name });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Nombre inválido.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { error } = await supabase.rpc('delete_flower_type', {
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

export async function renameFlowerType(
  oldName: string,
  newName: string,
): Promise<FlowerTypeActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const parsed = renameFlowerTypeSchema.safeParse({ oldName, newName });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos para renombrar.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { error } = await supabase.rpc('rename_flower_type', {
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
