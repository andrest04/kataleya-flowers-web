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
import { isAppwriteBackend } from '@/lib/appwrite/config';
import {
  deleteFlowerTypeAppwrite,
  getFlowerTypeUsage,
  renameFlowerTypeAppwrite,
} from '@/lib/appwrite/repositories/taxonomy';

interface SuccessResult {
  success: true;
}
type FlowerTypeActionResult = SuccessResult | AdminActionFailure;

export async function deleteFlowerType(name: string): Promise<FlowerTypeActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = deleteFlowerTypeSchema.safeParse({ name });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Nombre inválido.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (isAppwriteBackend()) {
      // Mirror the Supabase FK-RESTRICT behaviour: check usage before deleting
      const usage = await getFlowerTypeUsage(parsed.data.name);
      if (usage.length > 0) {
        return {
          success: false,
          error: 'Este tipo de flor está en uso por uno o más productos y no puede eliminarse.',
          code: 'FLOWER_TYPE_IN_USE',
        };
      }

      await deleteFlowerTypeAppwrite(parsed.data.name);

      revalidatePath('/');
      revalidatePath('/catalogo');
      revalidatePath('/admin/productos');
      return { success: true };
    }

    // ── Supabase path ─────────────────────────────────────────────────────────
    const { supabase } = ctx as { supabase: import('@/features/admin/utils/auth').AdminSupabaseClient };

    const { error } = await supabase
      .from('flower_types')
      .delete()
      .eq('name', parsed.data.name);

    if (error) {
      // 23503 = FK RESTRICT violation — flower type is assigned to one or more products
      if (error.code === '23503') {
        return {
          success: false,
          error: 'Este tipo de flor está en uso por uno o más productos y no puede eliminarse.',
          code: 'FLOWER_TYPE_IN_USE',
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

export async function renameFlowerType(
  oldName: string,
  newName: string,
): Promise<FlowerTypeActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = renameFlowerTypeSchema.safeParse({ oldName, newName });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos para renombrar.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (isAppwriteBackend()) {
      const result = await renameFlowerTypeAppwrite(parsed.data.oldName, parsed.data.newName);
      if (result === 'duplicate') {
        return {
          success: false,
          error: 'Ya existe un tipo de flor con ese nombre.',
          code: 'INTERNAL',
        };
      }
      if (result === 'not_found') {
        return {
          success: false,
          error: 'Tipo de flor no encontrado.',
          code: 'INTERNAL',
        };
      }

      revalidatePath('/');
      revalidatePath('/catalogo');
      revalidatePath('/admin/productos');
      return { success: true };
    }

    // ── Supabase path ─────────────────────────────────────────────────────────
    const { supabase } = ctx as { supabase: import('@/features/admin/utils/auth').AdminSupabaseClient };
    const normalizedNew = parsed.data.newName.toLowerCase().trim();

    const { error } = await supabase
      .from('flower_types')
      .update({ name: normalizedNew })
      .eq('name', parsed.data.oldName);

    if (error) {
      // 23505 = UNIQUE violation — the new name already exists
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Ya existe un tipo de flor con ese nombre.',
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
