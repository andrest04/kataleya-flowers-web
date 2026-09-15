'use server';

import { revalidatePath, updateTag } from 'next/cache';

import {
  deleteFlowerTypeSchema,
  renameFlowerTypeSchema,
} from '@/features/admin/schemas/flowerType';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { taxonomyRepository } from '@/lib/database/repositories/taxonomy';
import { BASE_REVALIDATE_PATHS } from '@/lib/revalidation';

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

    const usage = await taxonomyRepository.getFlowerTypeUsage(parsed.data.name);
    if (usage.length > 0) {
      return {
        success: false,
        error: 'Este tipo de flor está en uso por uno o más productos y no puede eliminarse.',
        code: 'FLOWER_TYPE_IN_USE',
      };
    }

    await taxonomyRepository.deleteFlowerType(parsed.data.name);

    BASE_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
    updateTag('catalog-flower-types');
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

    const result = await taxonomyRepository.renameFlowerType(parsed.data.oldName, parsed.data.newName);
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

    BASE_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
    updateTag('catalog-flower-types');
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
