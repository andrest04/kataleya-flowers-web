'use server';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { revalidatePath, updateTag } from 'next/cache';
import type { ZodIssue } from 'zod';

import { persistCta } from '@/features/admin/components/PromoBannerEditor/mapDraft';
import { uuid } from '@/features/admin/schemas/common';
import { promoBannerSchema } from '@/features/admin/schemas/promoBanner';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  activatePromoPresetExclusive,
  countActivePromoPresets,
  createPromoBannerDocument,
  deletePromoPresetDocuments,
  findPromoBannerById,
  getNextPromoBannerOrder,
  listPromoBanners,
  listPromoBannersByPreset,
  reorderPromoBannersAppwrite,
  setPromoPresetActive,
  updatePromoBannerDocument,
} from '@/lib/appwrite/repositories/promoBanners';
import { imageStorage } from '@/lib/imageStorage';
import { promoPresetKey } from '@/lib/promoPresetKey';

const LAST_ACTIVE_ERROR = 'Tiene que quedar al menos uno activo.';

const FALLBACK_PROMO_IMAGES: Record<string, string> = {
  '/images/hero/gerberas.jpg': 'gerberas.jpg',
  '/images/hero/peonias.jpg': 'peonias.jpg',
};

async function ensureStoredPromoImage(url: string): Promise<string | AdminActionFailure> {
  if (imageStorage.isOwnedUrl(url)) return url;
  const filename = FALLBACK_PROMO_IMAGES[url];
  if (!filename) {
    return {
      success: false,
      error: 'La imagen debe servirse desde el storage propio del proyecto',
      code: 'VALIDATION',
    };
  }
  const buffer = await readFile(path.join(process.cwd(), 'public', 'images', 'hero', filename));
  return imageStorage.upload({
    buffer,
    filename,
    folder: 'contenido',
    mimeType: 'image/jpeg',
  });
}

async function parsePromoBannerInput(data: unknown): Promise<
  | { ok: true; value: ReturnType<typeof promoBannerSchema.parse> }
  | { ok: false; failure: AdminActionFailure }
> {
  if (!data || typeof data !== 'object' || !('imageUrl' in data) || typeof data.imageUrl !== 'string') {
    return {
      ok: false,
      failure: { success: false, error: 'Datos inválidos. Revisa el banner.', code: 'VALIDATION' },
    };
  }
  const storedUrl = await ensureStoredPromoImage(data.imageUrl);
  if (typeof storedUrl !== 'string') return { ok: false, failure: storedUrl };
  const parsed = promoBannerSchema.safeParse({ ...data, imageUrl: storedUrl });
  if (!parsed.success) {
    return {
      ok: false,
      failure: {
        success: false,
        error: 'Datos inválidos. Revisa el banner.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      },
    };
  }
  return { ok: true, value: parsed.data };
}

function prefixBannerIssues(issues: ZodIssue[] | undefined, prefix: 'a' | 'b'): ZodIssue[] {
  if (!issues) return [];
  return issues.map((issue) => (
    issue.path[0] === 'name'
      ? issue
      : { ...issue, path: [prefix, ...issue.path] }
  ));
}

function pairParseFailure(
  first: Awaited<ReturnType<typeof parsePromoBannerInput>>,
  second: Awaited<ReturnType<typeof parsePromoBannerInput>>,
): AdminActionFailure {
  const issues = [
    ...(!first.ok ? prefixBannerIssues(first.failure.issues, 'a') : []),
    ...(!second.ok ? prefixBannerIssues(second.failure.issues, 'b') : []),
  ];
  const fallback = !first.ok
    ? first.failure.error
    : !second.ok
      ? second.failure.error
      : 'Datos inválidos. Revisa los banners.';
  return { success: false, error: fallback, code: 'VALIDATION', issues };
}

type PromoBannerActionResult = { success: true } | AdminActionFailure;

function revalidateHomeContent(): void {
  revalidatePath('/');
  revalidatePath('/admin/inicio');
  updateTag('home-content');
}

function toWritePayload(
  value: ReturnType<typeof promoBannerSchema.parse>,
  displayOrder: number,
) {
  const cta = persistCta(value);
  return {
    contentPosition: value.contentPosition,
    ctaExternal: cta.ctaExternal,
    ctaHref: cta.ctaHref,
    ctaLabel: value.ctaLabel,
    description: value.description,
    displayOrder,
    endsAt: value.endsAt,
    imageUrl: value.imageUrl,
    isActive: value.isActive,
    name: value.name,
    startsAt: value.startsAt,
    title: value.title,
  };
}

export async function createPromoBanner(data: unknown): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    const parsed = await parsePromoBannerInput(data);
    if (!parsed.ok) return parsed.failure;
    const hasOtherActive = (await countActivePromoPresets()) > 0;
    const displayOrder = await getNextPromoBannerOrder();
    const isActive = hasOtherActive ? parsed.value.isActive : true;
    await createPromoBannerDocument(toWritePayload({ ...parsed.value, isActive }, displayOrder));
    if (isActive && hasOtherActive) {
      await activatePromoPresetExclusive(parsed.value.name);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function createPromoBannerPair(data: unknown): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    if (!Array.isArray(data) || data.length !== 2) {
      return { success: false, error: 'Datos inválidos. Revisa los banners.', code: 'VALIDATION' };
    }
    const parsed = [
      await parsePromoBannerInput(data[0]),
      await parsePromoBannerInput(data[1]),
    ];
    if (!parsed[0].ok || !parsed[1].ok) return pairParseFailure(parsed[0], parsed[1]);
    const hasOtherActive = (await countActivePromoPresets()) > 0;
    const displayOrder = await getNextPromoBannerOrder();
    const isActive = hasOtherActive ? parsed[0].value.isActive : true;
    const name = parsed[0].value.name;
    await createPromoBannerDocument(toWritePayload({ ...parsed[0].value, isActive, name }, displayOrder));
    await createPromoBannerDocument(toWritePayload({ ...parsed[1].value, isActive, name }, displayOrder + 1));
    if (isActive && hasOtherActive) {
      await activatePromoPresetExclusive(name);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updatePromoBanner(id: string, data: unknown): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const parsed = await parsePromoBannerInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await findPromoBannerById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese banner.', code: 'INTERNAL' };
    }
    if (existing.is_active && !parsed.value.isActive) {
      const otherActive = await countActivePromoPresets(promoPresetKey(existing));
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
    }
    await updatePromoBannerDocument(idParsed.data, toWritePayload(parsed.value, existing.display_order));
    if (parsed.value.isActive) {
      await activatePromoPresetExclusive(parsed.value.name);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updatePromoBannerPair(ids: unknown, data: unknown): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    if (!Array.isArray(ids) || ids.length !== 2 || !Array.isArray(data) || data.length !== 2) {
      return { success: false, error: 'Datos inválidos. Revisa los banners.', code: 'VALIDATION' };
    }
    const idA = uuid.safeParse(ids[0]);
    const idB = uuid.safeParse(ids[1]);
    if (!idA.success || !idB.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION' };
    }
    const parsed = [
      await parsePromoBannerInput(data[0]),
      await parsePromoBannerInput(data[1]),
    ];
    if (!parsed[0].ok || !parsed[1].ok) return pairParseFailure(parsed[0], parsed[1]);
    const existingA = await findPromoBannerById(idA.data);
    const existingB = await findPromoBannerById(idB.data);
    if (!existingA || !existingB) {
      return { success: false, error: 'No encontramos esos banners.', code: 'INTERNAL' };
    }
    const name = parsed[0].value.name;
    const isActive = parsed[0].value.isActive;
    if (existingA.is_active && !isActive) {
      const otherActive = await countActivePromoPresets(promoPresetKey(existingA));
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
    }
    await updatePromoBannerDocument(idA.data, toWritePayload({ ...parsed[0].value, name, isActive }, existingA.display_order));
    await updatePromoBannerDocument(idB.data, toWritePayload({ ...parsed[1].value, name, isActive }, existingB.display_order));
    if (isActive) {
      await activatePromoPresetExclusive(name);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function togglePromoPresetStatus(key: string, isActive: boolean): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    if (typeof key !== 'string' || key.trim() === '') {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION' };
    }
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
    }
    const members = await listPromoBannersByPreset(key);
    if (members.length === 0) {
      return { success: false, error: 'No encontramos esos banners.', code: 'INTERNAL' };
    }
    if (!isActive) {
      const otherActive = await countActivePromoPresets(key);
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
      await setPromoPresetActive(key, false);
    } else {
      await activatePromoPresetExclusive(key);
    }
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderPromoPresets(keys: string[]): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    if (!Array.isArray(keys) || keys.length === 0 || keys.some((key) => typeof key !== 'string' || key.trim() === '')) {
      return { success: false, error: 'Lista inválida.', code: 'VALIDATION' };
    }
    const banners = await listPromoBanners();
    const orderedIds = keys.flatMap((key) =>
      banners.filter((banner) => promoPresetKey(banner) === key).map((banner) => banner.id),
    );
    if (orderedIds.length === 0) {
      return { success: false, error: 'Lista inválida.', code: 'VALIDATION' };
    }
    await reorderPromoBannersAppwrite(orderedIds);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deletePromoPreset(key: string): Promise<PromoBannerActionResult> {
  try {
    await requireAdmin();
    if (typeof key !== 'string' || key.trim() === '') {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION' };
    }
    const members = await listPromoBannersByPreset(key);
    if (members.length === 0) {
      return { success: false, error: 'No encontramos esos banners.', code: 'INTERNAL' };
    }
    const remaining = await listPromoBanners();
    const otherKeys = new Set(
      remaining.filter((banner) => promoPresetKey(banner) !== key).map((banner) => promoPresetKey(banner)),
    );
    if (otherKeys.size === 0) {
      return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
    }
    if (members.some((banner) => banner.is_active)) {
      const otherActive = await countActivePromoPresets(key);
      if (otherActive === 0) {
        return { success: false, error: LAST_ACTIVE_ERROR, code: 'VALIDATION' };
      }
    }
    const imageUrls = await deletePromoPresetDocuments(key);
    if (imageUrls.length > 0) void imageStorage.deleteMany(imageUrls);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
