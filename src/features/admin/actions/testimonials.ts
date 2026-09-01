'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { uuid } from '@/features/admin/schemas/common';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import { testimonialSchema } from '@/features/admin/schemas/testimonial';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  FALLBACK_TESTIMONIALS,
  type TestimonialView,
} from '@/features/landing/queries/getPublishedTestimonials';
import { APPWRITE_BUCKETS } from '@/lib/appwrite/config';
import {
  createTestimonialDocument,
  deleteTestimonialDocument,
  findTestimonialById,
  getNextTestimonialOrder,
  listTestimonials,
  reorderTestimonialsAppwrite,
  setTestimonialActive,
  type TestimonialWritePayload,
  updateTestimonialDocument,
} from '@/lib/appwrite/repositories/testimonials';
import { imageStorage } from '@/lib/imageStorage';
import { parseAppwriteStorageUrl } from '@/lib/imageStorage/urlValidation';
import {
  HOME_TESTIMONIAL_LIMIT,
  HOME_TESTIMONIAL_LIMIT_COPY,
} from '@/lib/testimonialLimit';

type TestimonialActionResult = { success: true } | AdminActionFailure;

function revalidateHomeContent(): void {
  revalidatePath('/');
  revalidatePath('/admin/inicio');
  updateTag('home-content');
}

function isContentImage(url: string): boolean {
  return parseAppwriteStorageUrl(url)?.bucketId === APPWRITE_BUCKETS.content;
}

async function ensureStoredTestimonialImage(url: string): Promise<string | AdminActionFailure> {
  if (imageStorage.isOwnedUrl(url)) return url;
  return {
    success: false,
    error: 'La imagen debe servirse desde el storage propio del proyecto',
    code: 'VALIDATION',
  };
}

async function parseTestimonialInput(data: unknown): Promise<
  | { ok: true; value: ReturnType<typeof testimonialSchema.parse> }
  | { ok: false; failure: AdminActionFailure }
> {
  if (!data || typeof data !== 'object' || !('photoUrl' in data) || typeof data.photoUrl !== 'string') {
    return {
      ok: false,
      failure: { success: false, error: 'Datos inválidos. Revisa el testimonio.', code: 'VALIDATION' },
    };
  }
  const storedUrl = await ensureStoredTestimonialImage(data.photoUrl);
  if (typeof storedUrl !== 'string') return { ok: false, failure: storedUrl };
  const parsed = testimonialSchema.safeParse({ ...data, photoUrl: storedUrl });
  if (!parsed.success) {
    return {
      ok: false,
      failure: {
        success: false,
        error: 'Datos inválidos. Revisa el testimonio.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      },
    };
  }
  return { ok: true, value: parsed.data };
}

function readFromFallbackId(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('fromFallbackId' in data)) return undefined;
  const value = data.fromFallbackId;
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function toWritePayload(
  value: ReturnType<typeof testimonialSchema.parse>,
  displayOrder: number,
): TestimonialWritePayload {
  return {
    displayOrder,
    endsAt: value.endsAt,
    isActive: value.isActive,
    name: value.name,
    occasion: value.occasion,
    photoAlt: value.photoAlt,
    photoUrl: value.photoUrl,
    quote: value.quote,
    stars: value.stars,
    startsAt: value.startsAt,
  };
}

function activeCount(rows: { is_active: boolean }[]): number {
  return rows.filter((row) => row.is_active).length;
}

function limitFailure(): AdminActionFailure {
  return { success: false, error: HOME_TESTIMONIAL_LIMIT_COPY, code: 'VALIDATION' };
}

function payloadFromFallback(
  view: TestimonialView,
  displayOrder: number,
  photoUrl: string,
): TestimonialWritePayload {
  return {
    displayOrder,
    endsAt: null,
    isActive: true,
    name: view.name,
    occasion: view.occasion,
    photoAlt: view.photoAlt,
    photoUrl,
    quote: view.quote,
    stars: view.stars,
    startsAt: null,
  };
}

async function seedFallbackDocuments(
  exceptId: string | undefined,
  replacement?: TestimonialWritePayload,
): Promise<AdminActionFailure | null> {
  for (const [index, item] of FALLBACK_TESTIMONIALS.entries()) {
    const displayOrder = index + 1;
    if (exceptId && item.id === exceptId && replacement) {
      await createTestimonialDocument({ ...replacement, displayOrder });
      continue;
    }
    const storedUrl = await ensureStoredTestimonialImage(item.photoSrc);
    if (typeof storedUrl !== 'string') return storedUrl;
    await createTestimonialDocument(payloadFromFallback(item, displayOrder, storedUrl));
  }
  return null;
}

export async function createTestimonial(data: unknown): Promise<TestimonialActionResult> {
  try {
    await requireAdmin();
    const fromFallbackId = readFromFallbackId(data);
    const parsed = await parseTestimonialInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await listTestimonials();
    if (existing.length === 0) {
      const matchesFallback = FALLBACK_TESTIMONIALS.some((item) => item.id === fromFallbackId);
      if (matchesFallback) {
        const seedError = await seedFallbackDocuments(
          fromFallbackId,
          toWritePayload(parsed.value, 1),
        );
        if (seedError) return seedError;
      } else {
        const seedError = await seedFallbackDocuments(undefined);
        if (seedError) return seedError;
        if (parsed.value.isActive) return limitFailure();
        const displayOrder = await getNextTestimonialOrder();
        await createTestimonialDocument(toWritePayload(parsed.value, displayOrder));
      }
      revalidateHomeContent();
      return { success: true };
    }
    if (parsed.value.isActive && activeCount(existing) >= HOME_TESTIMONIAL_LIMIT) {
      return limitFailure();
    }
    const displayOrder = await getNextTestimonialOrder();
    await createTestimonialDocument(toWritePayload(parsed.value, displayOrder));
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateTestimonial(id: string, data: unknown): Promise<TestimonialActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const parsed = await parseTestimonialInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await findTestimonialById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese testimonio.', code: 'INTERNAL' };
    }
    if (parsed.value.isActive && !existing.is_active) {
      const others = await listTestimonials();
      if (activeCount(others.filter((row) => row.id !== existing.id)) >= HOME_TESTIMONIAL_LIMIT) {
        return limitFailure();
      }
    }
    await updateTestimonialDocument(
      idParsed.data,
      toWritePayload(parsed.value, existing.display_order),
    );
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleTestimonialStatus(
  id: string,
  isActive: boolean,
): Promise<TestimonialActionResult> {
  try {
    await requireAdmin();
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
    }
    const existingRows = await listTestimonials();
    if (existingRows.length === 0) {
      const fallback = FALLBACK_TESTIMONIALS.find((item) => item.id === id);
      if (!fallback) {
        return { success: false, error: 'No encontramos ese testimonio.', code: 'INTERNAL' };
      }
      const storedUrl = await ensureStoredTestimonialImage(fallback.photoSrc);
      if (typeof storedUrl !== 'string') return storedUrl;
      const seedError = await seedFallbackDocuments(id, {
        ...payloadFromFallback(fallback, 1, storedUrl),
        isActive,
      });
      if (seedError) return seedError;
      revalidateHomeContent();
      return { success: true };
    }
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findTestimonialById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese testimonio.', code: 'INTERNAL' };
    }
    if (isActive && !existing.is_active && activeCount(existingRows) >= HOME_TESTIMONIAL_LIMIT) {
      return limitFailure();
    }
    await setTestimonialActive(idParsed.data, isActive);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderTestimonials(ids: string[]): Promise<TestimonialActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de testimonios inválida.', code: 'VALIDATION' };
    }
    await reorderTestimonialsAppwrite(parsed.data.ids);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deleteTestimonial(id: string): Promise<TestimonialActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findTestimonialById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese testimonio.', code: 'INTERNAL' };
    }
    const imageUrl = await deleteTestimonialDocument(idParsed.data);
    if (imageUrl && isContentImage(imageUrl)) void imageStorage.delete(imageUrl);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
