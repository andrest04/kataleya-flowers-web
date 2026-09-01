import type { TestimonialView } from '@/features/landing/queries/getPublishedTestimonials';
import type { TestimonialRow } from '@/lib/db/rows';

import type { TestimonialDraft } from './types';

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function draftFromFallback(testimonial: TestimonialView): TestimonialDraft {
  return {
    endsAt: '',
    isActive: true,
    name: testimonial.name,
    occasion: testimonial.occasion,
    photoAlt: testimonial.photoAlt,
    photoUrl: testimonial.photoSrc,
    quote: testimonial.quote,
    stars: testimonial.stars,
    startsAt: '',
  };
}

export function draftFromTestimonial(testimonial: TestimonialRow): TestimonialDraft {
  return {
    endsAt: toDatetimeLocalValue(testimonial.ends_at),
    isActive: testimonial.is_active,
    name: testimonial.name,
    occasion: testimonial.occasion,
    photoAlt: testimonial.photo_alt,
    photoUrl: testimonial.photo_url,
    quote: testimonial.quote,
    stars: testimonial.stars,
    startsAt: toDatetimeLocalValue(testimonial.starts_at),
  };
}
