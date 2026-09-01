import type { PromoBannerView } from '@/features/landing/queries/getPublishedPromoBanners';
import { BUSINESS } from '@/lib/constants';
import type { PromoBannerRow } from '@/lib/db/rows';

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

export function persistCta(input: {
  ctaLabel: string;
  ctaType: PromoBannerCtaType;
  ctaValue: string | null;
}): { ctaExternal: boolean; ctaHref: string; ctaLabel: string } {
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
    ctaHref: BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault),
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

export function draftFromBanner(banner: PromoBannerRow): PromoBannerDraft {
  const ctaType = ctaTypeFromHref(banner.cta_href);
  return {
    contentPosition: banner.content_position,
    ctaLabel: banner.cta_label,
    ctaType,
    ctaValue: ctaType === 'url' ? banner.cta_href : '',
    description: banner.description,
    endsAt: toDatetimeLocalValue(banner.ends_at),
    imageUrl: banner.image_url,
    isActive: banner.is_active,
    name: banner.name ?? '',
    startsAt: toDatetimeLocalValue(banner.starts_at),
    title: banner.title,
  };
}
