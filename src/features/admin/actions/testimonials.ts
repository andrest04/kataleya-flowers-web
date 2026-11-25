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
  createOrderableHomeCollection,
  readFromFallbackId,
} from '@/features/admin/utils/orderableHomeCollection';
import {
  FALLBACK_TESTIMONIALS,
  type TestimonialView,
} from '@/features/landing/queries/getPublishedTestimonials';
import {
  HOME_TESTIMONIAL_LIMIT,
  HOME_TESTIMONIAL_LIMIT_COPY,
} from '@/features/landing/rules/testimonialLimit';
import { documentStore } from '@/lib/database';
import {
  testimonialRepository,
  type TestimonialWritePayload,
} from '@/lib/database/repositories/testimonials';
import { testimonialConfig } from '@/lib/database/repositories/testimonials/config';
import { imageStorage } from '@/lib/imageStorage';

type TestimonialActionResult = { success: true } | AdminActionFailure;

function revalidateHomeContent(): void {
  revalidatePath('/');
  revalidatePath('/admin/inicio');
  updateTag('home-content');
}

async function ensureStoredTestimonialImage(rawUrl: string): Promise<string | AdminActionFailure> {
  const url = rawUrl.trim();
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

const testimonials = createOrderableHomeCollection({
  store: documentStore,
  config: testimonialConfig,
  repository: testimonialRepository,
  activeLimit: HOME_TESTIMONIAL_LIMIT,
  limitCopy: HOME_TESTIMONIAL_LIMIT_COPY,
  notFoundCopy: 'No encontramos ese testimonio.',
  loadFallbacks: async () => FALLBACK_TESTIMONIALS,
  payloadFromFallback: async (view, displayOrder) => {
    const storedUrl = await ensureStoredTestimonialImage(view.photoSrc);
    if (typeof storedUrl !== 'string') return { ok: false, failure: storedUrl };
    return { ok: true, payload: payloadFromFallback(view, displayOrder, storedUrl) };
  },
});

export async function createTestimonial(data: unknown): Promise<TestimonialActionResult> {
  try {
    await requireAdmin();
    const parsed = await parseTestimonialInput(data);
    if (!parsed.ok) return parsed.failure;
    const failure = await testimonials.create({
      fromFallbackId: readFromFallbackId(data),
      isActive: parsed.value.isActive,
      toPayload: (displayOrder) => toWritePayload(parsed.value, displayOrder),
    });
    if (failure) return failure;
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
    const existing = await testimonialRepository.findById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese testimonio.', code: 'INTERNAL' };
    }
    const activationFailure = await testimonials.activationFailure(existing, parsed.value.isActive);
    if (activationFailure) return activationFailure;
    await testimonialRepository.update(
      idParsed.data,
      toWritePayload(parsed.value, existing.displayOrder),
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
    const failure = await testimonials.toggle(id, isActive);
    if (failure) return failure;
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
    await testimonialRepository.reorder(parsed.data.ids);
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
    const existing = await testimonialRepository.findById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese testimonio.', code: 'INTERNAL' };
    }
    const imageUrl = await testimonialRepository.delete(idParsed.data);
    if (imageUrl && imageStorage.isOwnedUrlInFolder(imageUrl, 'contenido')) void imageStorage.delete(imageUrl);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
