import {
  findPromoBannerById,
  listPromoBanners,
  listPromoBannersByPreset,
} from '@/lib/appwrite/repositories/promoBanners';
import type { PromoBannerRow } from '@/lib/db/rows';
import { promoPresetKey } from '@/lib/promoPresetKey';

export async function getAdminPromoBanners(): Promise<PromoBannerRow[]> {
  return listPromoBanners();
}

export async function getAdminPromoBannerById(id: string): Promise<PromoBannerRow | null> {
  return findPromoBannerById(id);
}

export async function getAdminPromoPresetByBannerId(id: string): Promise<PromoBannerRow[]> {
  const banner = await findPromoBannerById(id);
  if (!banner) return [];
  return listPromoBannersByPreset(promoPresetKey(banner));
}
