import type { OrderableCollectionRepository } from '@/lib/database/orderableCollection/types';
import type { DocumentStore } from '@/lib/database/types';
import { promoPresetKey } from '@/lib/promoPresetKey';

import type { PromoBanner, PromoBannerWritePayload } from './types';

type PromoBannerRepository = OrderableCollectionRepository<PromoBanner, PromoBannerWritePayload>;

export async function countActivePromoPresets(
  repository: PromoBannerRepository,
  exceptKey?: string,
): Promise<number> {
  const banners = await repository.list();
  const keys = new Set(
    banners
      .filter((banner) => banner.isActive && promoPresetKey(banner) !== exceptKey)
      .map((banner) => promoPresetKey(banner)),
  );
  return keys.size;
}

export async function listPromoBannersByPreset(
  repository: PromoBannerRepository,
  key: string,
): Promise<PromoBanner[]> {
  const banners = await repository.list();
  return banners.filter((banner) => promoPresetKey(banner) === key);
}

export async function activatePromoPresetExclusive(
  repository: PromoBannerRepository,
  store: DocumentStore,
  collectionId: string,
  key: string,
): Promise<void> {
  const banners = await repository.list();
  await store.runInTransaction(async (tx) => {
    await tx.bulkUpdate(
      banners.map((banner) => ({
        collectionId,
        id: banner.id,
        data: { is_active: promoPresetKey(banner) === key },
      })),
    );
  });
}

export async function setPromoPresetActive(
  repository: PromoBannerRepository,
  store: DocumentStore,
  collectionId: string,
  key: string,
  isActive: boolean,
): Promise<void> {
  const members = await listPromoBannersByPreset(repository, key);
  if (members.length === 0) return;
  await store.runInTransaction(async (tx) => {
    await tx.bulkUpdate(
      members.map((banner) => ({
        collectionId,
        id: banner.id,
        data: { is_active: isActive },
      })),
    );
  });
}

export async function deletePromoPresetDocuments(
  repository: PromoBannerRepository,
  key: string,
): Promise<string[]> {
  const members = await listPromoBannersByPreset(repository, key);
  const imageUrls: string[] = [];
  for (const banner of members) {
    const imageUrl = await repository.delete(banner.id);
    if (imageUrl) imageUrls.push(imageUrl);
  }
  return imageUrls;
}
