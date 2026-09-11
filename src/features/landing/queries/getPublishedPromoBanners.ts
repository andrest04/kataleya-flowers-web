import { unstable_cache } from 'next/cache';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { listPromoBanners } from '@/lib/appwrite/repositories/promoBanners';
import { isPublished } from '@/lib/publishing';
import { defaultWhatsappHref, type SiteSettings } from '@/lib/siteSettings';

export interface PromoBannerView {
  contentPosition: 'top' | 'bottom';
  cta: {
    external?: boolean;
    href: string;
    label: string;
    variant: 'primary' | 'whatsapp';
  };
  description: string;
  heading: string;
  id: string;
  imageSrc: string;
}

function resolvePromoCta(banner: {
  cta_external: boolean;
  cta_href: string;
  cta_label: string;
}): PromoBannerView['cta'] {
  return {
    external: banner.cta_external,
    href: banner.cta_href,
    label: banner.cta_label,
    variant: banner.cta_href.includes('wa.me') ? 'whatsapp' : 'primary',
  };
}

export function fallbackPromoBanners(
  settings: SiteSettings,
): readonly [PromoBannerView, PromoBannerView] {
  return [
    {
      contentPosition: 'top',
      cta: {
        external: true,
        href: defaultWhatsappHref(settings),
        label: 'Pedir por WhatsApp',
        variant: 'whatsapp',
      },
      description:
        'Pedidos confirmados a tiempo llegan el mismo día, directo a la puerta de quien más quieres.',
      heading: `Entrega el mismo día en ${settings.location}`,
      id: 'fallback-peonias',
      imageSrc: '/images/hero/peonias.jpg',
    },
    {
      contentPosition: 'bottom',
      cta: {
        href: '/catalogo',
        label: 'Ver catálogo',
        variant: 'primary',
      },
      description:
        'Cumpleaños, aniversarios, condolencias — flores frescas diseñadas para cada momento.',
      heading: 'Arreglos para toda ocasión',
      id: 'fallback-gerberas',
      imageSrc: '/images/hero/gerberas.jpg',
    },
  ];
}

type CachedPromoState =
  | { banners: PromoBannerView[]; status: 'published' }
  | { status: 'fallback' }
  | { status: 'hidden' };

const getCachedPromoState = unstable_cache(
  async (): Promise<CachedPromoState> => {
    const banners = await listPromoBanners();
    const now = new Date();
    const published = banners.filter((banner) => isPublished(banner, now));
    if (published.length > 0) {
      return {
        banners: published.map((banner) => ({
          contentPosition: banner.content_position,
          cta: resolvePromoCta(banner),
          description: banner.description,
          heading: banner.title,
          id: banner.id,
          imageSrc: banner.image_url,
        })),
        status: 'published',
      };
    }
    return { status: banners.length === 0 ? 'fallback' : 'hidden' };
  },
  ['home-published-promo-banners'],
  { tags: ['home-content'], revalidate: 300 },
);

export async function getPublishedPromoBanners(): Promise<PromoBannerView[]> {
  const [state, settings] = await Promise.all([
    getCachedPromoState(),
    getSiteSettings(),
  ]);
  if (state.status === 'published') return state.banners;
  if (state.status === 'fallback') return [...fallbackPromoBanners(settings)];
  return [];
}
