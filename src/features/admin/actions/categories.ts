'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { after } from 'next/server';

import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from '@/features/admin/schemas/category';
import { uuid } from '@/features/admin/schemas/common';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import type { CategoryFormData } from '@/features/admin/types';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { slugify } from '@/features/admin/utils/slugify';
import { isConflictError } from '@/lib/database';
import { categoryRepository } from '@/lib/database/repositories/categories';
import { imageStorage } from '@/lib/imageStorage';
import { BASE_REVALIDATE_PATHS } from '@/lib/revalidation';
interface SuccessResult {
  success: true;
}
type CategoryActionResult = SuccessResult | AdminActionFailure;

interface CountSuccess {
  count: number;
}
type CountResult = CountSuccess | (AdminActionFailure & { count: 0 });

async function revalidateAllCategoryPaths(
  affectedSlugs?: string[],
): Promise<void> {
  BASE_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
  updateTag('catalog-categories');
  updateTag('catalog-products');

  const slugs = affectedSlugs ?? (await categoryRepository.listAllSlugs());
  for (const slug of slugs) {
    if (slug) revalidatePath(`/catalogo/${slug}`);
  }
}

export async function createCategory(
  data: CategoryFormData,
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();

    const parsed = categoryCreateSchema.safeParse(data);
    if (!parsed.success) {
      after(() => console.warn('[createCategory] validation failed:', parsed.error.issues));
      return {
        success: false,
        error: 'Datos inválidos. Revisa el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (parsed.data.imageUrl && !imageStorage.isOwnedUrl(parsed.data.imageUrl)) {
      return {
        success: false,
        error: 'URL de imagen no permitida.',
        code: 'VALIDATION',
      };
    }

    const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

    const nextOrder = parsed.data.displayOrder || (await categoryRepository.getNextOrder());
    try {
      await categoryRepository.create({
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        occasion: (parsed.data as CategoryFormData).occasion || null,
        imageUrl: parsed.data.imageUrl || null,
        displayOrder: nextOrder,
        isActive: (parsed.data as CategoryFormData).isActive,
        isFeatured: (parsed.data as CategoryFormData).isFeatured,
      });
    } catch (writeErr) {
      if (isConflictError(writeErr)) {
        return { success: false, error: 'Ya existe un registro con esos datos.', code: 'INTERNAL' };
      }
      throw writeErr;
    }

    await revalidateAllCategoryPaths([slug]);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateCategory(
  id: string,
  data: CategoryFormData,
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }

    const parsed = categoryUpdateSchema.safeParse(data);
    if (!parsed.success) {
      after(() => console.warn('[updateCategory] validation failed:', parsed.error.issues));
      return {
        success: false,
        error: 'Datos inválidos. Revisa el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (parsed.data.imageUrl && !imageStorage.isOwnedUrl(parsed.data.imageUrl)) {
      return {
        success: false,
        error: 'URL de imagen no permitida.',
        code: 'VALIDATION',
      };
    }

    const current = await categoryRepository.findById(idParsed.data);

    const incomingSlug = parsed.data.slug?.trim() ?? '';
    const slug =
      incomingSlug && incomingSlug !== current?.slug
        ? incomingSlug
        : (current?.slug ?? slugify(parsed.data.name));

    try {
      await categoryRepository.update(idParsed.data, {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        occasion: (parsed.data as CategoryFormData).occasion || null,
        imageUrl: parsed.data.imageUrl || null,
        displayOrder: (parsed.data as CategoryFormData).displayOrder,
        isActive: (parsed.data as CategoryFormData).isActive,
        isFeatured: (parsed.data as CategoryFormData).isFeatured,
      });
    } catch (writeErr) {
      if (isConflictError(writeErr)) {
        return { success: false, error: 'Ya existe un registro con esos datos.', code: 'INTERNAL' };
      }
      throw writeErr;
    }

    if (current?.imageUrl && current.imageUrl !== parsed.data.imageUrl) {
      void imageStorage.delete(current.imageUrl);
    }

    const affected = [current?.slug, slug].filter(
      (value): value is string => typeof value === 'string',
    );
    await revalidateAllCategoryPaths(affected);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function getCategoryProductCount(
  categoryId: string,
): Promise<CountResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(categoryId);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
        count: 0,
      };
    }

    const count = await categoryRepository.countProducts(idParsed.data);
    return { count };
  } catch (err) {
    const failure = failureFromUnknown(err);
    return { ...failure, count: 0 };
  }
}

export async function deleteCategory(
  id: string,
  mode: 'reassign' | 'cascade',
  reassignTo?: string,
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (mode !== 'reassign' && mode !== 'cascade') {
      return {
        success: false,
        error: 'Modo de eliminación inválido.',
        code: 'VALIDATION',
      };
    }

    if (mode === 'cascade') {
      const imageUrls = await categoryRepository.deleteCascade(idParsed.data);
      if (imageUrls.length > 0) void imageStorage.deleteMany(imageUrls);
    } else {
      const reassignParsed = uuid.safeParse(reassignTo);
      if (!reassignParsed.success) {
        return {
          success: false,
          error: 'Selecciona una categoría destino válida para reasignar los productos.',
          code: 'VALIDATION',
        };
      }
      const imageUrl = await categoryRepository.deleteReassign(idParsed.data, reassignParsed.data);
      if (imageUrl) void imageStorage.delete(imageUrl);
    }

    await revalidateAllCategoryPaths();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean,
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (typeof isActive !== 'boolean') {
      return {
        success: false,
        error: 'Estado inválido.',
        code: 'VALIDATION',
      };
    }

    const current = await categoryRepository.findById(idParsed.data);
    await categoryRepository.setActive(idParsed.data, isActive);
    await revalidateAllCategoryPaths(current?.slug ? [current.slug] : undefined);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderCategories(ids: string[]): Promise<CategoryActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de categorías inválida.', code: 'VALIDATION' };
    }
    await categoryRepository.reorder(parsed.data.ids);
    await revalidateAllCategoryPaths();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleCategoryFeatured(
  id: string,
  isFeatured: boolean,
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (typeof isFeatured !== 'boolean') {
      return {
        success: false,
        error: 'Estado inválido.',
        code: 'VALIDATION',
      };
    }

    const current = await categoryRepository.findById(idParsed.data);
    await categoryRepository.setFeatured(idParsed.data, isFeatured);
    await revalidateAllCategoryPaths(current?.slug ? [current.slug] : undefined);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
