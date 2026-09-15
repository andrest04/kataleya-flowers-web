import { beforeEach, describe, expect, it } from 'vitest';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';

import { createFakeDocumentStore } from '../../testUtils/fakeDocumentStore';
import { createCategoryRepository } from './appwriteRepository';
import type { CategoryWritePayload } from './types';

const C = APPWRITE_COLLECTIONS;

function seedCategory(
  store: ReturnType<typeof createFakeDocumentStore>,
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string | null;
    occasion: string | null;
    display_order: number;
    is_active: boolean;
    is_featured: boolean;
  }> = {},
): void {
  store.seed('categories', {
    id: overrides.id ?? 'cat-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    name: overrides.name ?? 'Rosas',
    slug: overrides.slug ?? 'rosas',
    description: overrides.description ?? 'Rosas rojas frescas',
    image_url: overrides.image_url ?? null,
    occasion: overrides.occasion ?? null,
    display_order: overrides.display_order ?? 1,
    is_active: overrides.is_active ?? true,
    is_featured: overrides.is_featured ?? false,
  });
}

describe('createCategoryRepository (documentStore-backed methods)', () => {
  let store: ReturnType<typeof createFakeDocumentStore>;
  let repository: ReturnType<typeof createCategoryRepository>;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createCategoryRepository(store);
  });

  describe('listActive', () => {
    it('returns only active categories ordered by displayOrder, mapped to camelCase', async () => {
      seedCategory(store, { id: 'c2', display_order: 2, is_active: true });
      seedCategory(store, { id: 'c1', display_order: 1, is_active: true, image_url: 'https://x/c1.jpg' });
      seedCategory(store, { id: 'c3', display_order: 3, is_active: false });

      const result = await repository.listActive();

      expect(result.map((category) => category.id)).toEqual(['c1', 'c2']);
      expect(result[0]).toEqual({
        id: 'c1',
        name: 'Rosas',
        slug: 'rosas',
        description: 'Rosas rojas frescas',
        imageUrl: 'https://x/c1.jpg',
        occasion: null,
        displayOrder: 1,
        isActive: true,
        isFeatured: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });

  describe('listAll', () => {
    it('returns every category ordered by displayOrder regardless of isActive', async () => {
      seedCategory(store, { id: 'c2', display_order: 2, is_active: false });
      seedCategory(store, { id: 'c1', display_order: 1, is_active: true });

      const result = await repository.listAll();

      expect(result.map((category) => category.id)).toEqual(['c1', 'c2']);
    });
  });

  describe('findById', () => {
    it('returns the mapped category when it exists', async () => {
      seedCategory(store, { id: 'c1' });

      const result = await repository.findById('c1');

      expect(result?.id).toBe('c1');
      expect(result?.isActive).toBe(true);
    });

    it('returns null when the category does not exist', async () => {
      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('listPriceFrom', () => {
    it('maps the lowest price of every active product to its category', async () => {
      store.seed('products', {
        id: 'p1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        category_id: 'c1',
        price: 80,
        is_active: true,
      });
      store.seed('products', {
        id: 'p2',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        category_id: 'c1',
        price: 60,
        is_active: true,
      });
      store.seed('products', {
        id: 'p3',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        category_id: 'c1',
        price: 10,
        is_active: false,
      });

      const result = await repository.listPriceFrom();

      expect(result.get('c1')).toBe(60);
    });
  });

  describe('getNextOrder', () => {
    it('returns 1 when there are no categories yet', async () => {
      await expect(repository.getNextOrder()).resolves.toBe(1);
    });

    it('returns one more than the highest existing displayOrder', async () => {
      seedCategory(store, { id: 'c1', display_order: 5 });
      seedCategory(store, { id: 'c2', display_order: 2 });

      await expect(repository.getNextOrder()).resolves.toBe(6);
    });
  });

  describe('create', () => {
    it('persists the category and returns the generated id', async () => {
      const payload: CategoryWritePayload = {
        name: 'Orquídeas',
        slug: 'orquideas',
        description: 'Orquídeas premium',
        occasion: 'aniversario',
        imageUrl: 'https://x/orquideas.jpg',
        displayOrder: 3,
        isActive: true,
        isFeatured: true,
      };

      const id = await repository.create(payload);
      const created = await repository.findById(id);

      expect(created).toMatchObject({
        id,
        name: 'Orquídeas',
        slug: 'orquideas',
        description: 'Orquídeas premium',
        occasion: 'aniversario',
        imageUrl: 'https://x/orquideas.jpg',
        displayOrder: 3,
        isActive: true,
        isFeatured: true,
      });
    });
  });

  describe('update', () => {
    it('overwrites every writable field', async () => {
      seedCategory(store, { id: 'c1', name: 'Rosas' });

      await repository.update('c1', {
        name: 'Rosas Premium',
        slug: 'rosas-premium',
        description: 'Nueva descripción',
        occasion: 'cumpleaños',
        imageUrl: 'https://x/rosas-premium.jpg',
        displayOrder: 9,
        isActive: false,
        isFeatured: true,
      });

      const updated = await repository.findById('c1');
      expect(updated).toMatchObject({
        name: 'Rosas Premium',
        slug: 'rosas-premium',
        description: 'Nueva descripción',
        occasion: 'cumpleaños',
        imageUrl: 'https://x/rosas-premium.jpg',
        displayOrder: 9,
        isActive: false,
        isFeatured: true,
      });
    });
  });

  describe('countProducts', () => {
    it('counts only products belonging to the given category', async () => {
      store.seed('products', { id: 'p1', createdAt: '', updatedAt: '', category_id: 'c1' });
      store.seed('products', { id: 'p2', createdAt: '', updatedAt: '', category_id: 'c1' });
      store.seed('products', { id: 'p3', createdAt: '', updatedAt: '', category_id: 'c2' });

      await expect(repository.countProducts('c1')).resolves.toBe(2);
      await expect(repository.countProducts('c2')).resolves.toBe(1);
    });
  });

  describe('setActive', () => {
    it('flips isActive without touching other fields', async () => {
      seedCategory(store, { id: 'c1', is_active: true });

      await repository.setActive('c1', false);

      await expect(repository.findById('c1')).resolves.toMatchObject({ isActive: false, name: 'Rosas' });
    });
  });

  describe('setFeatured', () => {
    it('flips isFeatured without touching other fields', async () => {
      seedCategory(store, { id: 'c1', is_featured: false });

      await repository.setFeatured('c1', true);

      await expect(repository.findById('c1')).resolves.toMatchObject({ isFeatured: true, name: 'Rosas' });
    });
  });

  describe('reorder', () => {
    it('reassigns the requested displayOrder slots in the given order', async () => {
      seedCategory(store, { id: 'a', display_order: 1 });
      seedCategory(store, { id: 'b', display_order: 2 });
      seedCategory(store, { id: 'c', display_order: 3 });

      await repository.reorder(['c', 'a', 'b']);

      const all = await repository.listAll();
      const byId = new Map(all.map((category) => [category.id, category.displayOrder]));
      expect(byId.get('c')).toBe(1);
      expect(byId.get('a')).toBe(2);
      expect(byId.get('b')).toBe(3);
    });

    it('ignores ids that no longer exist and still reorders the present ones', async () => {
      seedCategory(store, { id: 'a', display_order: 1 });

      await expect(repository.reorder(['a', 'missing'])).resolves.toBeUndefined();

      await expect(repository.findById('a')).resolves.toMatchObject({ displayOrder: 1 });
    });
  });

  describe('listAllSlugs', () => {
    it('returns the slug of every category', async () => {
      seedCategory(store, { id: 'c1', slug: 'rosas' });
      seedCategory(store, { id: 'c2', slug: 'orquideas' });

      const slugs = await repository.listAllSlugs();

      expect(slugs.sort()).toEqual(['orquideas', 'rosas']);
    });
  });
});

describe('deleteCascade/deleteReassign (cross-repository products dependency)', () => {
  let store: ReturnType<typeof createFakeDocumentStore>;
  let repository: ReturnType<typeof createCategoryRepository>;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createCategoryRepository(store);
  });

  describe('deleteCascade', () => {
    it('deletes known product relations, every product, and the category, returning their image urls', async () => {
      seedCategory(store, { id: 'cat-1' });
      store.seed(C.products, {
        id: 'p1',
        createdAt: '',
        updatedAt: '',
        category_id: 'cat-1',
      });
      store.seed(C.products, {
        id: 'p2',
        createdAt: '',
        updatedAt: '',
        category_id: 'cat-1',
      });
      store.seed(C.colorAssignments, { id: 'ca1', createdAt: '', updatedAt: '', product_id: 'p1' });
      store.seed(C.flowerTypeAssignments, { id: 'fa1', createdAt: '', updatedAt: '', product_id: 'p2' });
      store.seed(C.productImages, {
        id: 'img1',
        createdAt: '',
        updatedAt: '',
        product_id: 'p1',
        url: 'https://x/img1.jpg',
      });

      const imageUrls = await repository.deleteCascade('cat-1');

      expect(imageUrls).toEqual(['https://x/img1.jpg']);
      await expect(store.getById(C.products, 'p1')).resolves.toBeNull();
      await expect(store.getById(C.products, 'p2')).resolves.toBeNull();
      await expect(store.getById(C.colorAssignments, 'ca1')).resolves.toBeNull();
      await expect(store.getById(C.flowerTypeAssignments, 'fa1')).resolves.toBeNull();
      await expect(store.getById(C.productImages, 'img1')).resolves.toBeNull();
      await expect(store.getById(C.categories, 'cat-1')).resolves.toBeNull();
    });

    it('returns an empty list when the category has no products', async () => {
      seedCategory(store, { id: 'cat-empty' });

      const imageUrls = await repository.deleteCascade('cat-empty');

      expect(imageUrls).toEqual([]);
      await expect(store.getById(C.categories, 'cat-empty')).resolves.toBeNull();
    });
  });

  describe('deleteReassign', () => {
    it('moves every product to the target category, deletes the category, and returns its image url', async () => {
      seedCategory(store, { id: 'cat-1', image_url: 'https://x/cover.jpg' });
      store.seed(C.products, { id: 'p1', createdAt: '', updatedAt: '', category_id: 'cat-1' });
      store.seed(C.products, { id: 'p2', createdAt: '', updatedAt: '', category_id: 'cat-1' });

      const imageUrl = await repository.deleteReassign('cat-1', 'cat-2');

      expect(imageUrl).toBe('https://x/cover.jpg');
      await expect(store.getById(C.products, 'p1')).resolves.toMatchObject({ category_id: 'cat-2' });
      await expect(store.getById(C.products, 'p2')).resolves.toMatchObject({ category_id: 'cat-2' });
      await expect(store.getById(C.categories, 'cat-1')).resolves.toBeNull();
    });

    it('returns null when the category being deleted has no image', async () => {
      seedCategory(store, { id: 'cat-1', image_url: null });

      await expect(repository.deleteReassign('cat-1', 'cat-2')).resolves.toBeNull();
    });
  });
});
