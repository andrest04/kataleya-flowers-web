import type { DiscoverTileView } from '@/features/landing/queries/getPublishedDiscoverTiles';
import type { DiscoverTile } from '@/lib/database/repositories/discoverTiles';

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

export function draftFromDiscoverTile(tile: DiscoverTile): DiscoverTileDraft {
  return {
    description: tile.description,
    endsAt: toDatetimeLocalValue(tile.endsAt),
    href: tile.href,
    icon: tile.icon,
    imageUrl: tile.imageUrl,
    isActive: tile.isActive,
    isExternal: tile.isExternal,
    startsAt: toDatetimeLocalValue(tile.startsAt),
    title: tile.title,
  };
}
