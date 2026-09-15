import { documentStore } from '@/lib/database';
import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';
import type { DocumentRecord } from '@/lib/database/types';

import { heroSlideConfig } from './config';
import type { HeroSlide, HeroSlideWritePayload } from './types';

export type { HeroCtaType, HeroSlide, HeroSlideWritePayload } from './types';

export const heroSlideRepository = createOrderableCollectionRepository<HeroSlide, HeroSlideWritePayload>(
  documentStore,
  heroSlideConfig,
);

export async function countActiveHeroSlides(exceptId?: string): Promise<number> {
  const slides = await heroSlideRepository.list();
  return slides.filter((slide) => slide.isActive && slide.id !== exceptId).length;
}

export async function getFrontHeroSlideOrder(): Promise<number> {
  const first = await documentStore.findOne<DocumentRecord & Record<string, unknown>>(
    heroSlideConfig.collectionId,
    { orderBy: { field: 'display_order', direction: 'asc' }, limit: 1 },
  );
  const value = first?.display_order;
  return (typeof value === 'number' ? value : 1) - 1;
}

export async function activateHeroSlideExclusive(id: string): Promise<void> {
  const slides = await heroSlideRepository.list();
  await documentStore.runInTransaction(async (tx) => {
    await tx.bulkUpdate(
      slides.map((slide) => ({
        collectionId: heroSlideConfig.collectionId,
        id: slide.id,
        data: { is_active: slide.id === id },
      })),
    );
  });
}
