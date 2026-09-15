import { beforeEach, describe, expect, it } from 'vitest';

import { BUSINESS } from '@/lib/constants';
import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';
import type { OrderableCollectionRepository } from '@/lib/database/orderableCollection/types';
import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';

import { promoBannerConfig } from './config';
import {
  activatePromoPresetExclusive,
  countActivePromoPresets,
  deletePromoPresetDocuments,
  listPromoBannersByPreset,
  setPromoPresetActive,
} from './presetOperations';
import type { PromoBanner, PromoBannerWritePayload } from './types';

function seedBanner(
  store: FakeDocumentStore,
  id: string,
  overrides: Partial<{ name: string | null; isActive: boolean; displayOrder: number }> = {},
) {
  store.seed('promo_banners', {
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    content_position: 'top',
    cta_external: true,
    cta_href: BUSINESS.whatsapp,
    cta_label: 'Pedir por WhatsApp',
    description: 'desc',
    display_order: overrides.displayOrder ?? 1,
    ends_at: null,
    image_url: `https://example.com/${id}.jpg`,
    is_active: overrides.isActive ?? false,
    name: overrides.name ?? null,
    starts_at: null,
    title: id,
  });
}

describe('promoBanners presetOperations', () => {
  let store: FakeDocumentStore;
  let repository: OrderableCollectionRepository<PromoBanner, PromoBannerWritePayload>;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createOrderableCollectionRepository(store, promoBannerConfig);
  });

  describe('listPromoBannersByPreset / countActivePromoPresets', () => {
    it('groups banners by their preset key (name, falling back to id)', async () => {
      seedBanner(store, 'a1', { name: 'peonias', isActive: true });
      seedBanner(store, 'a2', { name: 'peonias', isActive: true });
      seedBanner(store, 'b1', { name: null, isActive: false });

      const peonias = await listPromoBannersByPreset(repository, 'peonias');
      expect(peonias.map((banner) => banner.id).sort()).toEqual(['a1', 'a2']);

      const soloBanner = await listPromoBannersByPreset(repository, 'b1');
      expect(soloBanner.map((banner) => banner.id)).toEqual(['b1']);
    });

    it('counts distinct active preset keys, excluding one key', async () => {
      seedBanner(store, 'a1', { name: 'peonias', isActive: true });
      seedBanner(store, 'a2', { name: 'peonias', isActive: true });
      seedBanner(store, 'b1', { name: 'gerberas', isActive: true });

      await expect(countActivePromoPresets(repository)).resolves.toBe(2);
      await expect(countActivePromoPresets(repository, 'peonias')).resolves.toBe(1);
    });
  });

  describe('activatePromoPresetExclusive', () => {
    it('activates every banner in the given preset and deactivates the rest', async () => {
      seedBanner(store, 'a1', { name: 'peonias', isActive: true });
      seedBanner(store, 'a2', { name: 'peonias', isActive: true });
      seedBanner(store, 'b1', { name: 'gerberas', isActive: false });

      await activatePromoPresetExclusive(repository, store, promoBannerConfig.collectionId, 'gerberas');

      const rows = await repository.list();
      const byId = new Map(rows.map((row) => [row.id, row.isActive]));
      expect(byId.get('a1')).toBe(false);
      expect(byId.get('a2')).toBe(false);
      expect(byId.get('b1')).toBe(true);
    });
  });

  describe('setPromoPresetActive', () => {
    it('sets every banner in the preset to the given state', async () => {
      seedBanner(store, 'a1', { name: 'peonias', isActive: true });
      seedBanner(store, 'a2', { name: 'peonias', isActive: true });

      await setPromoPresetActive(repository, store, promoBannerConfig.collectionId, 'peonias', false);

      const rows = await repository.list();
      expect(rows.every((row) => !row.isActive)).toBe(true);
    });

    it('does nothing when the preset has no members', async () => {
      await expect(
        setPromoPresetActive(repository, store, promoBannerConfig.collectionId, 'missing', true),
      ).resolves.toBeUndefined();
    });
  });

  describe('deletePromoPresetDocuments', () => {
    it('deletes every banner in the preset and returns their image urls', async () => {
      seedBanner(store, 'a1', { name: 'peonias' });
      seedBanner(store, 'a2', { name: 'peonias' });

      const urls = await deletePromoPresetDocuments(repository, 'peonias');

      expect(urls.sort()).toEqual(['https://example.com/a1.jpg', 'https://example.com/a2.jpg']);
      await expect(repository.list()).resolves.toEqual([]);
    });
  });
});
