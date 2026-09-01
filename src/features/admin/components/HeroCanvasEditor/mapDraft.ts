import type { HeroSlideView } from '@/features/landing/components/HeroSection/types';
import type { HeroCtaType, HeroSlideRow } from '@/lib/db/rows';

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

export function draftFromSlide(slide: HeroSlideRow): HeroDraft {
  return {
    altText: slide.alt_text,
    ctaLabel: slide.cta_label ?? '',
    ctaType: slide.cta_type,
    ctaValue: slide.cta_value ?? '',
    endsAt: toDatetimeLocalValue(slide.ends_at),
    focus: slide.focus ?? '70% center',
    imageUrl: slide.image_url,
    isActive: slide.is_active,
    kicker: slide.kicker,
    name: slide.name ?? '',
    startsAt: toDatetimeLocalValue(slide.starts_at),
    title: slide.title,
  };
}
