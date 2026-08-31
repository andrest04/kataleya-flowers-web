'use server';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { revalidatePath, updateTag } from 'next/cache';

import { uuid } from '@/features/admin/schemas/common';
import { heroSlideSchema } from '@/features/admin/schemas/heroSlide';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  activateHeroSlideExclusive,
  countActiveHeroSlides,
  createHeroSlideDocument,
  deleteHeroSlideDocument,
  findHeroSlideById,
  getFrontHeroSlideOrder,
  listHeroSlides,
  reorderHeroSlidesAppwrite,
  setHeroSlideActive,
  updateHeroSlideDocument,
} from '@/lib/appwrite/repositories/heroSlides';
import { imageStorage } from '@/lib/imageStorage';

const LAST_ACTIVE_ERROR = 'Tiene que quedar al menos un slide activo.';
const FALLBACK_HERO_IMAGE = '/images/hero/rosas.jpg';

async function ensureStoredHeroImage(url: string): Promise<string | AdminActionFailure> {
  if (imageStorage.isOwnedUrl(url)) return url;
  if (url !== FALLBACK_HERO_IMAGE) {
    return {
      success: false,
      error: 'La imagen debe servirse desde el storage propio del proyecto',
      code: 'VALIDATION',
    };
  }
  const buffer = await readFile(path.join(process.cwd(), 'public', 'images', 'hero', 'rosas.jpg'));
  return imageStorage.upload({
    buffer,
    filename: 'rosas.jpg',
    folder: 'contenido',
    mimeType: 'image/jpeg',
  });
}

async function parseHeroSlideInput(data: unknown): Promise<
  | { ok: true; value: ReturnType<typeof heroSlideSchema.parse> }
  | { ok: false; failure: AdminActionFailure }
> {
  if (!data || typeof data !== 'object' || !('imageUrl' in data) || typeof data.imageUrl !== 'string') {
    return {
      ok: false,
      failure: { success: false, error: 'Datos inválidos. Revisa el hero.', code: 'VALIDATION' },
    };
  }
  const storedUrl = await ensureStoredHeroImage(data.imageUrl);
  if (typeof storedUrl !== 'string') return { ok: false, failure: storedUrl };
  const parsed = heroSlideSchema.safeParse({ ...data, imageUrl: storedUrl });
  if (!parsed.success) {
    return {
      ok: false,
      failure: {
        success: false,
        error: 'Datos inválidos. Revisa el hero.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      },
    };
  }
  return { ok: true, value: parsed.data };
}

type HeroSlideActionResult = { success: true } | AdminActionFailure;

function revalidateHomeContent(): void {
  revalidatePath('/');
  revalidatePath('/admin/inicio');
  updateTag('home-content');
}

export async function createHeroSlide(data: unknown): Promise<HeroSlideActionResult> {
  try {
    await requireAdmin();
    const parsed = await parseHeroSlideInput(data);
    if (!parsed.ok) return parsed.failure;
    const hasOtherActive = (await countActiveHeroSlides()) > 0;
    const displayOrder = await getFrontHeroSlideOrder();
    const isActive = hasOtherActive ? parsed.value.isActive : true;
    const id = await createHeroSlideDocument({
      ...parsed.value,
      displayOrder,
      isActive,
    });
    if (isActive && hasOtherActive) {
      await activateHeroSlideExclusive(id);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateHeroSlide(id: string, data: unknown): Promise<HeroSlideActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const parsed = await parseHeroSlideInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await findHeroSlideById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese slide.', code: 'INTERNAL' };
    }
    if (existing.is_active && !parsed.value.isActive) {
      const otherActive = await countActiveHeroSlides(existing.id);
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
    }
    await updateHeroSlideDocument(idParsed.data, {
      ...parsed.value,
      displayOrder: existing.display_order,
    });
    if (parsed.value.isActive) {
      await activateHeroSlideExclusive(idParsed.data);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleHeroSlideStatus(id: string, isActive: boolean): Promise<HeroSlideActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
    }
    if (!isActive) {
      const otherActive = await countActiveHeroSlides(idParsed.data);
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
      await setHeroSlideActive(idParsed.data, false);
    } else {
      await activateHeroSlideExclusive(idParsed.data);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderHeroSlides(ids: string[]): Promise<HeroSlideActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de slides inválida.', code: 'VALIDATION' };
    }
    await reorderHeroSlidesAppwrite(parsed.data.ids);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deleteHeroSlide(id: string): Promise<HeroSlideActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findHeroSlideById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese slide.', code: 'INTERNAL' };
    }
    const remaining = await listHeroSlides();
    if (remaining.length <= 1) {
      return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
    }
    if (existing.is_active) {
      const otherActive = remaining.filter((slide) => slide.is_active && slide.id !== existing.id).length;
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
    }
    const imageUrl = await deleteHeroSlideDocument(idParsed.data);
    if (imageUrl) void imageStorage.delete(imageUrl);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
