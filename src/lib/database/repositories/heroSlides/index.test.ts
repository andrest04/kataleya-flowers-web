import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';

const fakeStore = createFakeDocumentStore();

vi.mock('@/lib/database', () => ({ documentStore: fakeStore }));

const { activateHeroSlideExclusive, countActiveHeroSlides, getFrontHeroSlideOrder, heroSlideRepository } =
  await import('./index');

function seedSlide(id: string, overrides: Partial<{ displayOrder: number; isActive: boolean }> = {}) {
  fakeStore.seed('hero_slides', {
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    alt_text: 'alt',
    cta_label: null,
    cta_type: 'catalogo',
    cta_value: null,
    display_order: overrides.displayOrder ?? 1,
    ends_at: null,
    focus: null,
    image_url: `https://example.com/${id}.jpg`,
    is_active: overrides.isActive ?? false,
    kicker: 'kicker',
    name: id,
    starts_at: null,
    subtitle: null,
    title: id,
  });
}

describe('heroSlides extras', () => {
  beforeEach(() => {
    fakeStore.reset();
  });

  describe('countActiveHeroSlides', () => {
    it('counts active slides, excluding the given id', async () => {
      seedSlide('s1', { isActive: true });
      seedSlide('s2', { isActive: true });
      seedSlide('s3', { isActive: false });

      await expect(countActiveHeroSlides()).resolves.toBe(2);
      await expect(countActiveHeroSlides('s1')).resolves.toBe(1);
    });
  });

  describe('getFrontHeroSlideOrder', () => {
    it('returns 0 when the collection is empty', async () => {
      await expect(getFrontHeroSlideOrder()).resolves.toBe(0);
    });

    it('returns one before the lowest existing displayOrder', async () => {
      seedSlide('s1', { displayOrder: 5 });
      seedSlide('s2', { displayOrder: 8 });

      await expect(getFrontHeroSlideOrder()).resolves.toBe(4);
    });
  });

  describe('activateHeroSlideExclusive', () => {
    it('makes only the given slide active', async () => {
      seedSlide('s1', { isActive: true });
      seedSlide('s2', { isActive: false });

      await activateHeroSlideExclusive('s2');

      const rows = await heroSlideRepository.list();
      const byId = new Map(rows.map((row) => [row.id, row.isActive]));
      expect(byId.get('s1')).toBe(false);
      expect(byId.get('s2')).toBe(true);
    });
  });
});
