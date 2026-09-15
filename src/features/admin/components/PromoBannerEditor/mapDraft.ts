import type { PromoBannerView } from '@/features/landing/queries/getPublishedPromoBanners';
import type { PromoBanner } from '@/lib/database/repositories/promoBanners';

import type { PromoBannerCtaType, PromoBannerDraft } from './types';

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ctaTypeFromHref(href: string): PromoBannerCtaType {
  if (href === '/catalogo') return 'catalogo';
  if (href.includes('wa.me')) return 'whatsapp';
  return 'url';
}

export function persistCta(
  input: {
    ctaLabel: string;
    ctaType: PromoBannerCtaType;
    ctaValue: string | null;
  },
  whatsappHref: string,
): { ctaExternal: boolean; ctaHref: string; ctaLabel: string } {
  if (input.ctaType === 'catalogo') {
    return {
      ctaExternal: false,
      ctaHref: '/catalogo',
      ctaLabel: input.ctaLabel,
    };
  }
  if (input.ctaType === 'url') {
    return {
      ctaExternal: true,
      ctaHref: input.ctaValue ?? '',
      ctaLabel: input.ctaLabel,
    };
  }
  return {
    ctaExternal: true,
    ctaHref: whatsappHref,
    ctaLabel: input.ctaLabel,
  };
}

export function draftFromFallback(banner: PromoBannerView): PromoBannerDraft {
  const ctaType = ctaTypeFromHref(banner.cta.href);
  return {
    contentPosition: banner.contentPosition,
    ctaLabel: banner.cta.label,
    ctaType,
    ctaValue: ctaType === 'url' ? banner.cta.href : '',
    description: banner.description,
    endsAt: '',
    imageUrl: banner.imageSrc,
    isActive: true,
    name: '',
    startsAt: '',
    title: banner.heading,
  };
}

export function draftFromBanner(banner: PromoBanner): PromoBannerDraft {
  const ctaType = ctaTypeFromHref(banner.ctaHref);
  return {
    contentPosition: banner.contentPosition,
    ctaLabel: banner.ctaLabel,
    ctaType,
    ctaValue: ctaType === 'url' ? banner.ctaHref : '',
    description: banner.description,
    endsAt: toDatetimeLocalValue(banner.endsAt),
    imageUrl: banner.imageUrl,
    isActive: banner.isActive,
    name: banner.name ?? '',
    startsAt: toDatetimeLocalValue(banner.startsAt),
    title: banner.title,
  };
}
