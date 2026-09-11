import { unstable_cache } from 'next/cache';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { listHeroSlides } from '@/lib/appwrite/repositories/heroSlides';
import { isPublished } from '@/lib/publishing';
import type { SiteSettings } from '@/lib/siteSettings';

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
