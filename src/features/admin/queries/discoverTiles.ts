import { findDiscoverTileById, listDiscoverTiles } from '@/lib/appwrite/repositories/discoverTiles';
import type { DiscoverTileRow } from '@/lib/db/rows';

export async function getAdminDiscoverTiles(): Promise<DiscoverTileRow[]> {
  return listDiscoverTiles();
}

export async function getAdminDiscoverTileById(id: string): Promise<DiscoverTileRow | null> {
  return findDiscoverTileById(id);
}
