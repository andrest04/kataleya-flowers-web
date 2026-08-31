import { findHeroSlideById, listHeroSlides } from '@/lib/appwrite/repositories/heroSlides';
import type { HeroSlideRow } from '@/lib/db/rows';

export async function getAdminHeroSlides(): Promise<HeroSlideRow[]> {
  return listHeroSlides();
}

export async function getAdminHeroSlideById(id: string): Promise<HeroSlideRow | null> {
  return findHeroSlideById(id);
}
