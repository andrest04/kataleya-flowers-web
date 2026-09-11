import { unstable_cache } from 'next/cache';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { listDiscoverTiles } from '@/lib/appwrite/repositories/discoverTiles';
import { HOME_DISCOVER_TILE_LIMIT } from '@/lib/discoverTileLimit';
import { isPublished } from '@/lib/publishing';
import { defaultWhatsappHref, type SiteSettings } from '@/lib/siteSettings';

export interface DiscoverTileView {
  description: string;
  external: boolean;
  href: string;
  icon: string;
  id: string;
  imageSrc: string;
  title: string;
}

export function fallbackDiscoverTiles(settings: SiteSettings): readonly DiscoverTileView[] {
  return [
    {
      description: `Pedidos a tiempo llegan el mismo día en ${settings.location}.`,
      external: false,
      href: '/#contacto',
      icon: 'truck',
      id: 'd-001',
      imageSrc: '/images/hero/rosas.jpg',
      title: 'Entrega el mismo día',
    },
    {
      description: 'Atención personalizada, de principio a fin, por WhatsApp.',
      external: true,
      href: defaultWhatsappHref(settings),
      icon: 'message-circle',
      id: 'd-002',
      imageSrc: '/about-florist-table.jpg',
      title: 'Pedir por WhatsApp',
    },
    {
      description: 'Libro de Reclamaciones a tu disposición, como manda la ley.',
      external: false,
      href: '/libro-de-reclamaciones',
      icon: 'shield-check',
      id: 'd-003',
      imageSrc: '/contact-floral-texture.jpg',
      title: 'Reclamos y garantía',
    },
  ];
}

type CachedDiscoverTileState =
  | { status: 'published'; tiles: DiscoverTileView[] }
  | { status: 'fallback' }
  | { status: 'hidden' };

const getCachedDiscoverTileState = unstable_cache(
  async (): Promise<CachedDiscoverTileState> => {
    const tiles = await listDiscoverTiles();
    const now = new Date();
    const published = tiles.filter((tile) => isPublished(tile, now));
    if (published.length > 0) {
      return {
        status: 'published',
        tiles: published.slice(0, HOME_DISCOVER_TILE_LIMIT).map((tile) => ({
          description: tile.description,
          external: tile.is_external,
          href: tile.href,
          icon: tile.icon,
          id: tile.id,
          imageSrc: tile.image_url,
          title: tile.title,
        })),
      };
    }
    return { status: tiles.length === 0 ? 'fallback' : 'hidden' };
  },
  ['home-published-discover-tiles'],
  { tags: ['home-content'], revalidate: 300 },
);

export async function getPublishedDiscoverTiles(): Promise<DiscoverTileView[]> {
  const [state, settings] = await Promise.all([
    getCachedDiscoverTileState(),
    getSiteSettings(),
  ]);
  if (state.status === 'published') return state.tiles;
  if (state.status === 'fallback') return [...fallbackDiscoverTiles(settings)];
  return [];
}
