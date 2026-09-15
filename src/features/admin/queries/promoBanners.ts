import {
  listPromoBannersByPreset,
  type PromoBanner,
  promoBannerRepository,
} from '@/lib/database/repositories/promoBanners';
import { promoPresetKey } from '@/lib/promoPresetKey';

export type { PromoBanner };

export async function getAdminPromoBanners(): Promise<PromoBanner[]> {
  return promoBannerRepository.list();
}

export async function getAdminPromoBannerById(id: string): Promise<PromoBanner | null> {
  return promoBannerRepository.findById(id);
}

export async function getAdminPromoPresetByBannerId(id: string): Promise<PromoBanner[]> {
  const banner = await promoBannerRepository.findById(id);
  if (!banner) return [];
  return listPromoBannersByPreset(promoPresetKey(banner));
}
