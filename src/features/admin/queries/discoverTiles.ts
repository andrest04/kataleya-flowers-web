import { type DiscoverTile, discoverTileRepository } from '@/lib/database/repositories/discoverTiles';

export type { DiscoverTile };

export async function getAdminDiscoverTiles(): Promise<DiscoverTile[]> {
  return discoverTileRepository.list();
}

export async function getAdminDiscoverTileById(id: string): Promise<DiscoverTile | null> {
  return discoverTileRepository.findById(id);
}
