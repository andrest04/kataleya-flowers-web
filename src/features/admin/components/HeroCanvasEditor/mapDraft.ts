import type { HeroSlideView } from '@/features/landing/components/HeroSection/types';
import type { HeroCtaType, HeroSlide } from '@/lib/database/repositories/heroSlides';

import type { HeroDraft } from './types';

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function ctaTypeFromHref(href: string): HeroCtaType {
  if (href === '/catalogo') return 'catalogo';
  if (href.startsWith('https://wa.me/')) return 'whatsapp';
  return 'url';
}

export function draftFromLive(live: HeroSlideView): HeroDraft {
  const ctaType = ctaTypeFromHref(live.ctaHref);
  return {
    altText: live.imageAlt,
    ctaLabel: live.ctaLabel,
    ctaType,
    ctaValue: ctaType === 'url' ? live.ctaHref : '',
    endsAt: '',
    focus: live.focus,
    imageUrl: live.imageSrc,
    isActive: true,
    kicker: live.kicker,
    name: '',
    startsAt: '',
    title: live.title,
  };
}

export function draftFromSlide(slide: HeroSlide): HeroDraft {
  return {
    altText: slide.altText,
    ctaLabel: slide.ctaLabel ?? '',
    ctaType: slide.ctaType,
    ctaValue: slide.ctaValue ?? '',
    endsAt: toDatetimeLocalValue(slide.endsAt),
    focus: slide.focus ?? '70% center',
    imageUrl: slide.imageUrl,
    isActive: slide.isActive,
    kicker: slide.kicker,
    name: slide.name ?? '',
    startsAt: toDatetimeLocalValue(slide.startsAt),
    title: slide.title,
  };
}
