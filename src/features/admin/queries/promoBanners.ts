import { requireAdmin } from '@/features/admin/utils/auth';
import {
  listPromoBannersByPreset,
  type PromoBanner,
  promoBannerRepository,
} from '@/lib/database/repositories/promoBanners';
import { promoPresetKey } from '@/lib/promoPresetKey';

export type { PromoBanner };

export async function getAdminPromoBanners(): Promise<PromoBanner[]> {
  await requireAdmin();
  return promoBannerRepository.list();
}

export async function getAdminPromoBannerById(id: string): Promise<PromoBanner | null> {
  await requireAdmin();
  return promoBannerRepository.findById(id);
}

export async function getAdminPromoPresetByBannerId(id: string): Promise<PromoBanner[]> {
  await requireAdmin();
  const banner = await promoBannerRepository.findById(id);
  if (!banner) return [];
  return listPromoBannersByPreset(promoPresetKey(banner));
}
