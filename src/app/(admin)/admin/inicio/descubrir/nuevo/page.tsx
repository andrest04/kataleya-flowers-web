import Link from 'next/link';

import DiscoverTileEditor from '@/features/admin/components/DiscoverTileEditor';
import { draftFromFallback } from '@/features/admin/components/DiscoverTileEditor/mapDraft';
import { getAdminDiscoverTiles } from '@/features/admin/queries/discoverTiles';
import {
  fallbackDiscoverTiles,
  getPublishedDiscoverTiles,
} from '@/features/landing/queries/getPublishedDiscoverTiles';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { HOME_DISCOVER_TILE_LIMIT } from '@/lib/discoverTileLimit';

export const metadata = { title: 'Nueva tarjeta' };

interface NuevaTarjetaPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function NuevaTarjetaPage({ searchParams }: NuevaTarjetaPageProps) {
  const [{ from }, tiles, liveTiles, settings] = await Promise.all([
    searchParams,
    getAdminDiscoverTiles(),
    getPublishedDiscoverTiles(),
    getSiteSettings(),
  ]);
  const fallbacks = fallbackDiscoverTiles(settings);
  const fromFallback = fallbacks.find((item) => item.id === from);
  const source = fromFallback ?? liveTiles[0] ?? fallbacks[0];
  const isEditingFallback = Boolean(fromFallback) && tiles.length === 0;
  const initial = {
    ...draftFromFallback(source),
    isActive: isEditingFallback,
  };
  const activeCount = tiles.length === 0
    ? fallbacks.length
    : tiles.filter((item) => item.is_active).length;
  const allowActivate = initial.isActive || activeCount < HOME_DISCOVER_TILE_LIMIT;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">
        {isEditingFallback ? 'Editar tarjeta' : 'Nueva tarjeta'}
      </h1>
      <DiscoverTileEditor
        allowActivate={allowActivate}
        allowHide
        fromFallbackId={fromFallback?.id}
        initial={initial}
        showCancel
      />
    </div>
  );
}
