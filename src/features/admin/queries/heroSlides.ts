import { requireAdmin } from '@/features/admin/utils/auth';
import { type HeroSlide, heroSlideRepository } from '@/lib/database/repositories/heroSlides';

export type { HeroSlide };

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  await requireAdmin();
  return heroSlideRepository.list();
}

export async function getAdminHeroSlideById(id: string): Promise<HeroSlide | null> {
  await requireAdmin();
  return heroSlideRepository.findById(id);
}
