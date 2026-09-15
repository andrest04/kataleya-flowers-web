import { documentStore } from '@/lib/database';
import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';

import { promoBannerConfig } from './config';
import * as presetOperations from './presetOperations';
import type { PromoBanner, PromoBannerWritePayload } from './types';

export type { PromoBanner, PromoBannerWritePayload } from './types';

export const promoBannerRepository = createOrderableCollectionRepository<PromoBanner, PromoBannerWritePayload>(
  documentStore,
  promoBannerConfig,
);

export function countActivePromoPresets(exceptKey?: string): Promise<number> {
  return presetOperations.countActivePromoPresets(promoBannerRepository, exceptKey);
}

export function listPromoBannersByPreset(key: string): Promise<PromoBanner[]> {
  return presetOperations.listPromoBannersByPreset(promoBannerRepository, key);
}

export function activatePromoPresetExclusive(key: string): Promise<void> {
  return presetOperations.activatePromoPresetExclusive(
    promoBannerRepository,
    documentStore,
    promoBannerConfig.collectionId,
    key,
  );
}

export function setPromoPresetActive(key: string, isActive: boolean): Promise<void> {
  return presetOperations.setPromoPresetActive(
    promoBannerRepository,
    documentStore,
    promoBannerConfig.collectionId,
    key,
    isActive,
  );
}

export function deletePromoPresetDocuments(key: string): Promise<string[]> {
  return presetOperations.deletePromoPresetDocuments(promoBannerRepository, key);
}
