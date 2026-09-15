import { beforeEach, describe, expect, it } from 'vitest';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';
import type { DocumentRecord } from '@/lib/database/types';

import { createProductsRepository } from './appwriteRepository';
import type { ProductsRepository } from './types';

const C = APPWRITE_COLLECTIONS;

interface SeedProductOverrides {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  includes: string[];
  occasion: string | null;
  note: string | null;
  price_variants: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  createdAt: string;
  updatedAt: string;
}

function seedProduct(store: FakeDocumentStore, overrides: Partial<SeedProductOverrides> = {}): void {
  store.seed(C.products, {
    id: overrides.id ?? 'p1',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    category_id: overrides.category_id ?? 'cat-1',
    name: overrides.name ?? 'Ramo de Rosas',
    slug: overrides.slug ?? 'ramo-de-rosas',
    description: overrides.description ?? 'Un ramo hermoso',
    price: overrides.price ?? 100,
    includes: overrides.includes ?? [],
    occasion: overrides.occasion ?? null,
    note: overrides.note ?? null,
    price_variants: overrides.price_variants ?? null,
    display_order: overrides.display_order ?? 1,
    is_active: overrides.is_active ?? true,
    is_featured: overrides.is_featured ?? false,
  });
}

function seedCategory(
  store: FakeDocumentStore,
  overrides: Partial<{ id: string; slug: string; is_active: boolean }> = {},
): void {
  store.seed(C.categories, {
    id: overrides.id ?? 'cat-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    slug: overrides.slug ?? 'rosas',
    is_active: overrides.is_active ?? true,
  });
}

function seedImage(
  store: FakeDocumentStore,
  overrides: Partial<{
    id: string;
    product_id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
    display_order: number;
  }> = {},
): void {
  store.seed(C.productImages, {
    id: overrides.id ?? 'img-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    product_id: overrides.product_id ?? 'p1',
    url: overrides.url ?? 'https://x/img-1.jpg',
    alt_text: overrides.alt_text ?? null,
    is_primary: overrides.is_primary ?? true,
    display_order: overrides.display_order ?? 0,
  });
}

describe('createProductsRepository', () => {
  let store: FakeDocumentStore;
  let repository: ProductsRepository;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createProductsRepository(store);
  });

  describe('listActiveJoined', () => {
    it('returns only active products in active categories, ordered by displayOrder, with related data', async () => {
      seedCategory(store, { id: 'cat-1', is_active: true });
      seedCategory(store, { id: 'cat-inactive', is_active: false });
      seedProduct(store, { id: 'p2', category_id: 'cat-1', display_order: 2, is_active: true });
      seedProduct(store, { id: 'p1', category_id: 'cat-1', display_order: 1, is_active: true });
      seedProduct(store, { id: 'p3', category_id: 'cat-1', display_order: 3, is_active: false });
      seedProduct(store, { id: 'p4', category_id: 'cat-inactive', display_order: 4, is_active: true });
      seedImage(store, { id: 'i1', product_id: 'p1', url: 'https://x/p1.jpg', is_primary: true });

      const result = await repository.listActiveJoined();

      expect(result.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(result[0].imageUrl).toBe('https://x/p1.jpg');
    });

    it('returns an empty array when there are no products', async () => {
      await expect(repository.listActiveJoined()).resolves.toEqual([]);
    });
  });

  describe('findActiveJoinedBySlug', () => {
    it('finds an active product by slug', async () => {
      seedProduct(store, { id: 'p1', slug: 'ramo-de-rosas', is_active: true });

      const result = await repository.findActiveJoinedBySlug('ramo-de-rosas');

      expect(result?.id).toBe('p1');
    });

    it('returns null when the product is inactive', async () => {
      seedProduct(store, { id: 'p1', slug: 'ramo-de-rosas', is_active: false });

      await expect(repository.findActiveJoinedBySlug('ramo-de-rosas')).resolves.toBeNull();
    });

    it('returns null when no product matches the slug', async () => {
      await expect(repository.findActiveJoinedBySlug('missing')).resolves.toBeNull();
    });
  });

  describe('listActiveJoinedByCategorySlug', () => {
    it('lists active products of the active category matching the slug, ordered by displayOrder', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas', is_active: true });
      seedProduct(store, { id: 'p2', category_id: 'cat-1', display_order: 2 });
      seedProduct(store, { id: 'p1', category_id: 'cat-1', display_order: 1 });
      seedProduct(store, { id: 'p3', category_id: 'other-cat', display_order: 3 });

      const result = await repository.listActiveJoinedByCategorySlug('rosas');

      expect(result.map((p) => p.id)).toEqual(['p1', 'p2']);
    });

    it('returns an empty array when the category does not exist', async () => {
      await expect(repository.listActiveJoinedByCategorySlug('missing')).resolves.toEqual([]);
    });

    it('returns an empty array when the category is inactive', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas', is_active: false });
      seedProduct(store, { id: 'p1', category_id: 'cat-1' });

      await expect(repository.listActiveJoinedByCategorySlug('rosas')).resolves.toEqual([]);
    });
  });

  describe('listSitemap', () => {
    it('lists active products in active categories, most recently updated first', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas', is_active: true });
      seedProduct(store, {
        id: 'p1',
        category_id: 'cat-1',
        slug: 'p1',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      seedProduct(store, {
        id: 'p2',
        category_id: 'cat-1',
        slug: 'p2',
        updatedAt: '2026-02-01T00:00:00.000Z',
      });
      seedProduct(store, { id: 'p3', category_id: 'cat-1', slug: 'p3', is_active: false });

      const result = await repository.listSitemap();

      expect(result).toEqual([
        { slug: 'p2', categorySlug: 'rosas', updatedAt: '2026-02-01T00:00:00.000Z' },
        { slug: 'p1', categorySlug: 'rosas', updatedAt: '2026-01-01T00:00:00.000Z' },
      ]);
    });

    it('skips products whose category is missing or inactive', async () => {
      seedCategory(store, { id: 'cat-inactive', is_active: false });
      seedProduct(store, { id: 'p1', category_id: 'cat-inactive' });
      seedProduct(store, { id: 'p2', category_id: 'missing-cat' });

      await expect(repository.listSitemap()).resolves.toEqual([]);
    });
  });

  describe('listAdmin', () => {
    it('returns every product regardless of isActive, ordered by displayOrder', async () => {
      seedProduct(store, { id: 'p2', display_order: 2, is_active: false });
      seedProduct(store, { id: 'p1', display_order: 1, is_active: true });

      const result = await repository.listAdmin();

      expect(result.map((p) => p.id)).toEqual(['p1', 'p2']);
    });
  });

  describe('listAdminPage', () => {
    beforeEach(() => {
      seedProduct(store, { id: 'p1', name: 'Ramo de Rosas', display_order: 1, is_active: true });
      seedProduct(store, { id: 'p2', name: 'Caja de Tulipanes', display_order: 2, is_active: false });
      seedProduct(store, { id: 'p3', name: 'Ramo de Girasoles', display_order: 3, is_active: true });
    });

    it('paginates every product ordered by displayOrder', async () => {
      const page = await repository.listAdminPage({ page: 1, pageSize: 2 });

      expect(page.items.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(page.total).toBe(3);
      expect(page.page).toBe(1);
    });

    it('clamps to the last page when the requested page is out of range', async () => {
      const page = await repository.listAdminPage({ page: 99, pageSize: 2 });

      expect(page.page).toBe(2);
      expect(page.items.map((p) => p.id)).toEqual(['p3']);
    });

    it('filters by status', async () => {
      const page = await repository.listAdminPage({ page: 1, pageSize: 10, status: 'inactive' });

      expect(page.items.map((p) => p.id)).toEqual(['p2']);
    });

    it('filters by categoryId', async () => {
      seedProduct(store, { id: 'p4', category_id: 'other-cat', display_order: 4 });

      const page = await repository.listAdminPage({ page: 1, pageSize: 10, categoryId: 'other-cat' });

      expect(page.items.map((p) => p.id)).toEqual(['p4']);
    });

    it('filters by search text, accent- and case-insensitively', async () => {
      const page = await repository.listAdminPage({ page: 1, pageSize: 10, search: 'girasol' });

      expect(page.items.map((p) => p.id)).toEqual(['p3']);
    });

    it('filters to products with at most one image, scoped to active products only', async () => {
      seedImage(store, { id: 'img-p1-a', product_id: 'p1' });
      seedImage(store, { id: 'img-p1-b', product_id: 'p1', display_order: 1, is_primary: false });
      seedImage(store, { id: 'img-p3-a', product_id: 'p3' });

      const page = await repository.listAdminPage({
        page: 1,
        pageSize: 10,
        gallery: 'at-most-one-image',
      });

      expect(page.items.map((p) => p.id)).toEqual(['p3']);
    });
  });

  describe('findAdminById', () => {
    it('returns an inactive product too', async () => {
      seedProduct(store, { id: 'p1', is_active: false });

      const result = await repository.findAdminById('p1');

      expect(result?.id).toBe('p1');
      expect(result?.isActive).toBe(false);
    });

    it('returns null when the product does not exist', async () => {
      await expect(repository.findAdminById('missing')).resolves.toBeNull();
    });
  });

  describe('listAdminCategoryCounts', () => {
    it('counts every product per category regardless of isActive', async () => {
      seedProduct(store, { id: 'p1', category_id: 'cat-1', is_active: true });
      seedProduct(store, { id: 'p2', category_id: 'cat-1', is_active: false });
      seedProduct(store, { id: 'p3', category_id: 'cat-2', is_active: true });

      const counts = await repository.listAdminCategoryCounts(['cat-1', 'cat-2']);

      expect(counts).toEqual({ 'cat-1': 2, 'cat-2': 1 });
    });

    it('counts only active products with at most one image, per category', async () => {
      seedProduct(store, { id: 'p1', category_id: 'cat-1', is_active: true });
      seedProduct(store, { id: 'p2', category_id: 'cat-1', is_active: true });
      seedProduct(store, { id: 'p3', category_id: 'cat-1', is_active: false });
      seedImage(store, { id: 'img-a', product_id: 'p2' });
      seedImage(store, { id: 'img-b', product_id: 'p2', display_order: 1, is_primary: false });

      const counts = await repository.listAdminCategoryCounts(['cat-1'], 'at-most-one-image');

      expect(counts).toEqual({ 'cat-1': 1 });
    });
  });

  describe('getImageUrls', () => {
    it('returns the urls of every image for the product', async () => {
      seedImage(store, { id: 'img-a', product_id: 'p1', url: 'https://x/a.jpg' });
      seedImage(store, { id: 'img-b', product_id: 'p1', url: 'https://x/b.jpg' });
      seedImage(store, { id: 'img-c', product_id: 'other', url: 'https://x/c.jpg' });

      const urls = await repository.getImageUrls('p1');

      expect(urls.sort()).toEqual(['https://x/a.jpg', 'https://x/b.jpg']);
    });

    it('returns an empty array when the product has no images', async () => {
      await expect(repository.getImageUrls('p1')).resolves.toEqual([]);
    });
  });

  describe('getNextOrder', () => {
    it('returns 1 when there are no products yet', async () => {
      await expect(repository.getNextOrder()).resolves.toBe(1);
    });

    it('returns one more than the highest existing displayOrder', async () => {
      seedProduct(store, { id: 'p1', display_order: 7 });
      seedProduct(store, { id: 'p2', display_order: 3 });

      await expect(repository.getNextOrder()).resolves.toBe(8);
    });
  });

  describe('getCategorySlug', () => {
    it('returns the categoryId and categorySlug for the product', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas' });
      seedProduct(store, { id: 'p1', category_id: 'cat-1' });

      await expect(repository.getCategorySlug('p1')).resolves.toEqual({
        categoryId: 'cat-1',
        categorySlug: 'rosas',
      });
    });

    it('returns null when the product does not exist', async () => {
      await expect(repository.getCategorySlug('missing')).resolves.toBeNull();
    });

    it('returns null when the category does not exist', async () => {
      seedProduct(store, { id: 'p1', category_id: 'missing-cat' });

      await expect(repository.getCategorySlug('p1')).resolves.toBeNull();
    });
  });

  describe('getSlugById', () => {
    it('returns the slug of the product', async () => {
      seedProduct(store, { id: 'p1', slug: 'ramo-de-rosas' });

      await expect(repository.getSlugById('p1')).resolves.toBe('ramo-de-rosas');
    });

    it('returns null when the product does not exist', async () => {
      await expect(repository.getSlugById('missing')).resolves.toBeNull();
    });
  });

  describe('getCategorySlugById', () => {
    it('returns the slug of the category', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas' });

      await expect(repository.getCategorySlugById('cat-1')).resolves.toBe('rosas');
    });

    it('returns null when the category does not exist', async () => {
      await expect(repository.getCategorySlugById('missing')).resolves.toBeNull();
    });
  });

  describe('getCategorySlugsForProducts', () => {
    it('maps each distinct category to its slug', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas' });
      seedCategory(store, { id: 'cat-2', slug: 'tulipanes' });
      seedProduct(store, { id: 'p1', category_id: 'cat-1' });
      seedProduct(store, { id: 'p2', category_id: 'cat-2' });
      seedProduct(store, { id: 'p3', category_id: 'cat-1' });

      const result = await repository.getCategorySlugsForProducts(['p1', 'p2', 'p3']);

      expect(result).toEqual(
        new Map([
          ['cat-1', 'rosas'],
          ['cat-2', 'tulipanes'],
        ]),
      );
    });

    it('skips products or categories that no longer exist', async () => {
      seedProduct(store, { id: 'p1', category_id: 'missing-cat' });

      const result = await repository.getCategorySlugsForProducts(['p1', 'missing-product']);

      expect(result).toEqual(new Map());
    });
  });

  describe('createProductDocument', () => {
    it('persists the product with empty relation caches and returns the generated id', async () => {
      const id = await repository.createProductDocument({
        name: 'Ramo de Tulipanes',
        slug: 'ramo-de-tulipanes',
        description: 'Un ramo fresco',
        price: 90,
        categoryId: 'cat-1',
        imageUrl: 'https://x/cover.jpg',
        includes: ['tarjeta'],
        priceVariants: [{ label: 'Chico', price: 70 }],
        occasion: 'cumpleaños',
        note: null,
        isActive: true,
        isFeatured: false,
        displayOrder: 1,
      });

      const stored = await store.getById<DocumentRecord & Record<string, unknown>>(C.products, id);
      expect(stored).toMatchObject({
        category_id: 'cat-1',
        name: 'Ramo de Tulipanes',
        slug: 'ramo-de-tulipanes',
        description: 'Un ramo fresco',
        price: 90,
        image_url: 'https://x/cover.jpg',
        images: [],
        includes: ['tarjeta'],
        colors: [],
        flower_types: [],
        occasion: 'cumpleaños',
        note: null,
        price_variants: JSON.stringify([{ label: 'Chico', price: 70 }]),
        display_order: 1,
        is_active: true,
        is_featured: false,
      });
    });

    it('stores a null price_variants when none is given', async () => {
      const id = await repository.createProductDocument({
        name: 'Ramo simple',
        slug: 'ramo-simple',
        description: 'Sin variantes',
        price: 50,
        categoryId: 'cat-1',
        imageUrl: 'https://x/cover.jpg',
        includes: [],
        priceVariants: null,
        occasion: null,
        note: null,
        isActive: true,
        isFeatured: false,
        displayOrder: 1,
      });

      await expect(store.getById(C.products, id)).resolves.toMatchObject({ price_variants: null });
    });
  });

  describe('updateProductDocument', () => {
    it('overwrites the writable fields without touching the relation caches', async () => {
      seedProduct(store, { id: 'p1', name: 'Original' });
      await store.update(C.products, 'p1', { images: ['https://x/a.jpg'], colors: ['rojo'], flower_types: ['rosa'] });

      await repository.updateProductDocument('p1', {
        name: 'Actualizado',
        slug: 'actualizado',
        description: 'Nueva descripción',
        price: 130,
        categoryId: 'cat-2',
        imageUrl: 'https://x/new-cover.jpg',
        includes: ['tarjeta', 'chocolates'],
        priceVariants: null,
        occasion: null,
        note: 'nota',
        isActive: false,
        isFeatured: true,
        displayOrder: 5,
      });

      const stored = await store.getById<DocumentRecord & Record<string, unknown>>(C.products, 'p1');
      expect(stored).toMatchObject({
        name: 'Actualizado',
        slug: 'actualizado',
        description: 'Nueva descripción',
        price: 130,
        category_id: 'cat-2',
        image_url: 'https://x/new-cover.jpg',
        includes: ['tarjeta', 'chocolates'],
        note: 'nota',
        is_active: false,
        is_featured: true,
        display_order: 5,
        images: ['https://x/a.jpg'],
        colors: ['rojo'],
        flower_types: ['rosa'],
      });
    });
  });

  describe('deleteProductDocument', () => {
    it('removes the product document', async () => {
      seedProduct(store, { id: 'p1' });

      await repository.deleteProductDocument('p1');

      await expect(store.getById(C.products, 'p1')).resolves.toBeNull();
    });
  });

  describe('setProductActive', () => {
    it('flips isActive without touching other fields', async () => {
      seedProduct(store, { id: 'p1', is_active: true, name: 'Ramo de Rosas' });

      await repository.setProductActive('p1', false);

      await expect(store.getById(C.products, 'p1')).resolves.toMatchObject({
        is_active: false,
        name: 'Ramo de Rosas',
      });
    });
  });

  describe('bulkSetProductActive', () => {
    it('sets isActive on every listed product', async () => {
      seedProduct(store, { id: 'p1', is_active: false });
      seedProduct(store, { id: 'p2', is_active: false });

      await repository.bulkSetProductActive(['p1', 'p2'], true);

      await expect(store.getById(C.products, 'p1')).resolves.toMatchObject({ is_active: true });
      await expect(store.getById(C.products, 'p2')).resolves.toMatchObject({ is_active: true });
    });
  });

  describe('reorderProductsAppwrite', () => {
    it('reassigns the requested displayOrder slots in the given order', async () => {
      seedProduct(store, { id: 'a', display_order: 1 });
      seedProduct(store, { id: 'b', display_order: 2 });
      seedProduct(store, { id: 'c', display_order: 3 });

      await repository.reorderProductsAppwrite(['c', 'a', 'b']);

      const all = await repository.listAdmin();
      const byId = new Map(all.map((product) => [product.id, product.displayOrder]));
      expect(byId.get('c')).toBe(1);
      expect(byId.get('a')).toBe(2);
      expect(byId.get('b')).toBe(3);
    });

    it('aborts without changes when some ids no longer exist', async () => {
      seedProduct(store, { id: 'a', display_order: 1 });

      await expect(repository.reorderProductsAppwrite(['a', 'missing'])).resolves.toBeUndefined();

      await expect(store.getById(C.products, 'a')).resolves.toMatchObject({ display_order: 1 });
    });
  });

  describe('deleteProductWithRelations', () => {
    it('deletes the product and every relation document, leaving other products untouched', async () => {
      seedProduct(store, { id: 'p1' });
      seedProduct(store, { id: 'p2' });
      store.seed(C.colorAssignments, {
        id: 'ca1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p1',
        color_id: 'c1',
      });
      store.seed(C.flowerTypeAssignments, {
        id: 'fa1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p1',
        flower_type_id: 'f1',
      });
      seedImage(store, { id: 'img-1', product_id: 'p1' });

      await repository.deleteProductWithRelations('p1');

      await expect(store.getById(C.products, 'p1')).resolves.toBeNull();
      await expect(store.getById(C.colorAssignments, 'ca1')).resolves.toBeNull();
      await expect(store.getById(C.flowerTypeAssignments, 'fa1')).resolves.toBeNull();
      await expect(store.getById(C.productImages, 'img-1')).resolves.toBeNull();
      await expect(store.getById(C.products, 'p2')).resolves.not.toBeNull();
    });
  });

  describe('bulkDeleteProductsWithRelations', () => {
    it('deletes every requested product with its relations and returns cleanup metadata', async () => {
      seedCategory(store, { id: 'cat-1', slug: 'rosas' });
      seedProduct(store, { id: 'p1', category_id: 'cat-1', slug: 'p1' });
      await store.update(C.products, 'p1', { image_url: 'https://x/cover-p1.jpg' });
      seedImage(store, { id: 'img-1', product_id: 'p1', url: 'https://x/gallery-p1.jpg' });
      seedProduct(store, { id: 'p2', category_id: 'cat-1', slug: 'p2' });
      seedProduct(store, { id: 'p3', category_id: 'cat-1', slug: 'p3' });

      const deleted = await repository.bulkDeleteProductsWithRelations(['p1', 'p2']);

      expect(deleted.map((product) => product.slug).sort()).toEqual(['p1', 'p2']);
      const p1Meta = deleted.find((product) => product.slug === 'p1');
      expect(p1Meta).toMatchObject({ categoryId: 'cat-1', categorySlug: 'rosas' });
      expect(p1Meta?.imageUrls.sort()).toEqual(['https://x/cover-p1.jpg', 'https://x/gallery-p1.jpg']);

      await expect(store.getById(C.products, 'p1')).resolves.toBeNull();
      await expect(store.getById(C.products, 'p2')).resolves.toBeNull();
      await expect(store.getById(C.productImages, 'img-1')).resolves.toBeNull();
      await expect(store.getById(C.products, 'p3')).resolves.not.toBeNull();
    });

    it('returns an empty array when no ids are given', async () => {
      await expect(repository.bulkDeleteProductsWithRelations([])).resolves.toEqual([]);
    });
  });

  describe('createProductWithTaxonomy', () => {
    it('creates the product and its taxonomy relations atomically', async () => {
      store.seed(C.colors, {
        id: 'color-rojo',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'rojo',
        hex: '#f00',
        label: 'Rojo',
      });
      store.seed(C.flowerTypes, {
        id: 'flower-rosa',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'rosa',
      });

      const id = await repository.createProductWithTaxonomy(
        {
          name: 'Ramo de Rosas Rojas',
          slug: 'ramo-de-rosas-rojas',
          description: 'Un ramo hermoso',
          price: 120,
          categoryId: 'cat-1',
          imageUrl: 'https://x/cover.jpg',
          includes: [],
          priceVariants: null,
          occasion: null,
          note: null,
          isActive: true,
          isFeatured: false,
          displayOrder: 1,
        },
        {
          productName: 'Ramo de Rosas Rojas',
          colorNames: ['rojo'],
          flowerTypeNames: ['rosa'],
          imageUrl: 'https://x/cover.jpg',
          galleryImages: ['https://x/cover.jpg', 'https://x/gallery.jpg'],
        },
      );

      const product = await repository.findAdminById(id);
      expect(product?.colors).toEqual(['rojo']);
      expect(product?.flowerTypes).toEqual(['rosa']);
      expect(product?.imageUrl).toBe('https://x/cover.jpg');
      expect(product?.images).toEqual(['https://x/gallery.jpg']);

      const stored = await store.getById<DocumentRecord & Record<string, unknown>>(C.products, id);
      expect(stored).toMatchObject({ colors: ['rojo'], flower_types: ['rosa'] });
    });

    it('silently drops color/flower names that no longer exist', async () => {
      const id = await repository.createProductWithTaxonomy(
        {
          name: 'Ramo simple',
          slug: 'ramo-simple',
          description: 'x',
          price: 50,
          categoryId: 'cat-1',
          imageUrl: '',
          includes: [],
          priceVariants: null,
          occasion: null,
          note: null,
          isActive: true,
          isFeatured: false,
          displayOrder: 1,
        },
        {
          productName: 'Ramo simple',
          colorNames: ['inexistente'],
          flowerTypeNames: ['inexistente'],
          imageUrl: '',
          galleryImages: [],
        },
      );

      const product = await repository.findAdminById(id);
      expect(product?.colors).toEqual([]);
      expect(product?.flowerTypes).toEqual([]);
    });
  });

  describe('updateProductWithTaxonomy', () => {
    it('replaces the previous taxonomy relations with the new ones', async () => {
      seedProduct(store, { id: 'p1' });
      store.seed(C.colors, {
        id: 'color-rojo',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'rojo',
        hex: '#f00',
        label: 'Rojo',
      });
      store.seed(C.colors, {
        id: 'color-azul',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'azul',
        hex: '#00f',
        label: 'Azul',
      });
      store.seed(C.colorAssignments, {
        id: 'ca-old',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p1',
        color_id: 'color-rojo',
      });

      await repository.updateProductWithTaxonomy(
        'p1',
        {
          name: 'Ramo de Rosas',
          slug: 'ramo-de-rosas',
          description: 'Un ramo hermoso',
          price: 100,
          categoryId: 'cat-1',
          imageUrl: 'https://x/new-cover.jpg',
          includes: [],
          priceVariants: null,
          occasion: null,
          note: null,
          isActive: true,
          isFeatured: false,
          displayOrder: 1,
        },
        {
          productName: 'Ramo de Rosas',
          colorNames: ['azul'],
          flowerTypeNames: [],
          imageUrl: 'https://x/new-cover.jpg',
          galleryImages: [],
        },
      );

      await expect(store.getById(C.colorAssignments, 'ca-old')).resolves.toBeNull();
      const product = await repository.findAdminById('p1');
      expect(product?.colors).toEqual(['azul']);
      expect(product?.imageUrl).toBe('https://x/new-cover.jpg');
    });
  });
});
