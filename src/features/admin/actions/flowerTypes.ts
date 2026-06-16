'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteFlowerTypeSchema,
  renameFlowerTypeSchema,
} from '@/features/admin/schemas/flowerType';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
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
    await requireAdmin();

    const parsed = deleteFlowerTypeSchema.safeParse({ name });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Nombre inválido.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    // Enforce referential integrity: check usage before deleting
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
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function renameFlowerType(
  oldName: string,
  newName: string,
): Promise<FlowerTypeActionResult> {
  try {
    await requireAdmin();

    const parsed = renameFlowerTypeSchema.safeParse({ oldName, newName });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos para renombrar.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

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
  } catch (err) {
    return failureFromUnknown(err);
  }
}
