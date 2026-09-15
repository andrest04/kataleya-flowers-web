import { unstable_cache } from 'next/cache';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { type HeroSlide, heroSlideRepository } from '@/lib/database/repositories/heroSlides';
import { isPublished } from '@/lib/publishing';
import type { SiteSettings } from '@/lib/siteSettings';

import { CAMPAIGN_MODE, HERO_IMAGE } from '../components/HeroSection/constants';
import type { HeroSlideView } from '../components/HeroSection/types';

function isSlidePublished(slide: HeroSlide, now: Date): boolean {
  return isPublished({ ends_at: slide.endsAt, is_active: slide.isActive, starts_at: slide.startsAt }, now);
}

function resolveCta(
  slide: Pick<HeroSlide, 'ctaLabel' | 'ctaType' | 'ctaValue'>,
  whatsappHref: string,
): Pick<HeroSlideView, 'ctaExternal' | 'ctaHref' | 'ctaLabel'> {
  if (slide.ctaType === 'catalogo') {
    return {
      ctaExternal: false,
      ctaHref: '/catalogo',
      ctaLabel: slide.ctaLabel || 'Ver catálogo',
    };
  }
  if (slide.ctaType === 'url' && slide.ctaValue) {
    return {
      ctaExternal: true,
      ctaHref: slide.ctaValue,
      ctaLabel: slide.ctaLabel || 'Ver más',
    };
  }
  return {
    ctaExternal: true,
    ctaHref: whatsappHref,
    ctaLabel: slide.ctaLabel || 'Pedir por WhatsApp',
  };
}

export function fallbackHeroSlide(settings: SiteSettings): HeroSlideView {
  return {
    ctaExternal: CAMPAIGN_MODE === 'contact',
    ctaHref: CAMPAIGN_MODE === 'contact' ? settings.whatsapp : '/catalogo',
    ctaLabel: CAMPAIGN_MODE === 'contact' ? 'Pedir por WhatsApp' : 'Ver catálogo',
    focus: HERO_IMAGE.focus,
    imageAlt: HERO_IMAGE.alt,
    imageSrc: HERO_IMAGE.src,
    kicker: `Florería premium en ${settings.location}`,
    title: 'Flores que emocionan',
  };
}

type CachedHeroState =
  | { status: 'published'; slide: HeroSlideView }
  | { status: 'fallback'; slide: HeroSlideView }
  | { status: 'hidden' };

const getCachedHeroState = unstable_cache(
  async (): Promise<CachedHeroState> => {
    const [slides, settings] = await Promise.all([heroSlideRepository.list(), getSiteSettings()]);
    const now = new Date();
    const published = slides.filter((slide) => isSlidePublished(slide, now))[0];
    if (published) {
      return {
        status: 'published',
        slide: {
          ...resolveCta(published, settings.whatsapp),
          focus: published.focus || HERO_IMAGE.focus,
          imageAlt: published.altText,
          imageSrc: published.imageUrl,
          kicker: published.kicker,
          title: published.title,
        },
      };
    }
    if (slides.length === 0) {
      return { status: 'fallback', slide: fallbackHeroSlide(settings) };
    }
    return { status: 'hidden' };
  },
  ['home-published-hero-slide'],
  { tags: ['home-content', 'site-settings'], revalidate: 300 },
);

export async function getPublishedHeroSlide(): Promise<HeroSlideView | null> {
  const state = await getCachedHeroState();
  if (state.status === 'hidden') return null;
  return state.slide;
}
