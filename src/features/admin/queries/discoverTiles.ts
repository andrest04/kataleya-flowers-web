import { requireAdmin } from '@/features/admin/utils/auth';
import { type DiscoverTile, discoverTileRepository } from '@/lib/database/repositories/discoverTiles';

export type { DiscoverTile };

export async function getAdminDiscoverTiles(): Promise<DiscoverTile[]> {
  await requireAdmin();
  return discoverTileRepository.list();
}

export async function getAdminDiscoverTileById(id: string): Promise<DiscoverTile | null> {
  await requireAdmin();
  return discoverTileRepository.findById(id);
}
