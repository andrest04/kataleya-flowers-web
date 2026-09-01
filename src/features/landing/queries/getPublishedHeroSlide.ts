import { unstable_cache } from 'next/cache';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { listHeroSlides } from '@/lib/appwrite/repositories/heroSlides';
import { BUSINESS } from '@/lib/constants';
import { isPublished } from '@/lib/publishing';

import { CAMPAIGN_MODE, HERO_IMAGE } from '../components/HeroSection/constants';
import type { HeroSlideView } from '../components/HeroSection/types';

function resolveCta(
  slide: {
    cta_label: string | null;
    cta_type: 'whatsapp' | 'catalogo' | 'url';
    cta_value: string | null;
  },
  whatsappHref: string,
): Pick<HeroSlideView, 'ctaExternal' | 'ctaHref' | 'ctaLabel'> {
  if (slide.cta_type === 'catalogo') {
    return {
      ctaExternal: false,
      ctaHref: '/catalogo',
      ctaLabel: slide.cta_label || 'Ver catálogo',
    };
  }
  if (slide.cta_type === 'url' && slide.cta_value) {
    return {
      ctaExternal: true,
      ctaHref: slide.cta_value,
      ctaLabel: slide.cta_label || 'Ver más',
    };
  }
  return {
    ctaExternal: true,
    ctaHref: whatsappHref,
    ctaLabel: slide.cta_label || 'Pedir por WhatsApp',
  };
}

export const FALLBACK_HERO_SLIDE: HeroSlideView = {
  ctaExternal: CAMPAIGN_MODE === 'contact',
  ctaHref: CAMPAIGN_MODE === 'contact' ? BUSINESS.whatsapp : '/catalogo',
  ctaLabel: CAMPAIGN_MODE === 'contact' ? 'Pedir por WhatsApp' : 'Ver catálogo',
  focus: HERO_IMAGE.focus,
  imageAlt: HERO_IMAGE.alt,
  imageSrc: HERO_IMAGE.src,
  kicker: `Florería premium en ${BUSINESS.location}`,
  title: 'Flores que emocionan',
};

type CachedHeroState =
  | { status: 'published'; slide: HeroSlideView }
  | { status: 'fallback' }
  | { status: 'hidden' };

const getCachedHeroState = unstable_cache(
  async (): Promise<CachedHeroState> => {
    const [slides, settings] = await Promise.all([listHeroSlides(), getSiteSettings()]);
    const now = new Date();
    const published = slides.filter((slide) => isPublished(slide, now))[0];
    if (published) {
      return {
        status: 'published',
        slide: {
          ...resolveCta(published, settings.whatsapp),
          focus: published.focus || HERO_IMAGE.focus,
          imageAlt: published.alt_text,
          imageSrc: published.image_url,
          kicker: published.kicker,
          title: published.title,
        },
      };
    }
    return { status: slides.length === 0 ? 'fallback' : 'hidden' };
  },
  ['home-published-hero-slide'],
  { tags: ['home-content', 'site-settings'], revalidate: 300 },
);

export async function getPublishedHeroSlide(): Promise<HeroSlideView | null> {
  const state = await getCachedHeroState();
  if (state.status === 'published') return state.slide;
  if (state.status === 'fallback') return FALLBACK_HERO_SLIDE;
  return null;
}
