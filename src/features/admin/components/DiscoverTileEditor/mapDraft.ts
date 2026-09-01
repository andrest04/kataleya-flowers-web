import type { DiscoverTileView } from '@/features/landing/queries/getPublishedDiscoverTiles';
import type { DiscoverTileRow } from '@/lib/db/rows';

import type { DiscoverTileDraft } from './types';

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function draftFromFallback(tile: DiscoverTileView): DiscoverTileDraft {
  return {
    description: tile.description,
    endsAt: '',
    href: tile.href,
    icon: tile.icon,
    imageUrl: tile.imageSrc,
    isActive: true,
    isExternal: tile.external,
    startsAt: '',
    title: tile.title,
  };
}

export function draftFromDiscoverTile(tile: DiscoverTileRow): DiscoverTileDraft {
  return {
    description: tile.description,
    endsAt: toDatetimeLocalValue(tile.ends_at),
    href: tile.href,
    icon: tile.icon,
    imageUrl: tile.image_url,
    isActive: tile.is_active,
    isExternal: tile.is_external,
    startsAt: toDatetimeLocalValue(tile.starts_at),
    title: tile.title,
  };
}
