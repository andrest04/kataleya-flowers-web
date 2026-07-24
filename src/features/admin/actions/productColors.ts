'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteColorSchema,
  renameColorSchema,
} from '@/features/admin/schemas/color';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  deleteColorAppwrite,
  getColorUsage,
  renameColorAppwrite,
} from '@/lib/appwrite/repositories/taxonomy';

interface SuccessResult {
  success: true;
}
type ColorActionResult = SuccessResult | AdminActionFailure;

export async function deleteProductColor(name: string): Promise<ColorActionResult> {
  try {
    await requireAdmin();

    const parsed = deleteColorSchema.safeParse({ name });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Nombre inválido.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const usage = await getColorUsage(parsed.data.name);
    if (usage.length > 0) {
      return {
        success: false,
        error: 'Este color está en uso por uno o más productos y no puede eliminarse.',
        code: 'COLOR_IN_USE',
      };
    }

    await deleteColorAppwrite(parsed.data.name);

    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
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
    await requireAdmin();

    const parsed = renameColorSchema.safeParse({ oldName, newName });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos para renombrar.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const result = await renameColorAppwrite(parsed.data.oldName, parsed.data.newName);
    if (result === 'duplicate') {
      return {
        success: false,
        error: 'Ya existe un color con ese nombre.',
        code: 'INTERNAL',
      };
    }
    if (result === 'not_found') {
      return {
        success: false,
        error: 'Color no encontrado.',
        code: 'INTERNAL',
      };
    }

    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
