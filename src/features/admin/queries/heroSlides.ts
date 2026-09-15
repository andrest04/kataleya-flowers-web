import { type HeroSlide, heroSlideRepository } from '@/lib/database/repositories/heroSlides';

export type { HeroSlide };

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  return heroSlideRepository.list();
}

export async function getAdminHeroSlideById(id: string): Promise<HeroSlide | null> {
  return heroSlideRepository.findById(id);
}
