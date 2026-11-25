import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product as ProductRow } from '@/lib/database/repositories/products';

const mocks = vi.hoisted(() => ({
  cacheCalls: [] as { keyParts: string[] | undefined; options: { tags?: string[]; revalidate?: number | false } | undefined }[],
  productsRepository: {
    findActiveJoinedBySlug: vi.fn(),
    listActiveJoined: vi.fn(),
  },
  categoryRepository: {
    listActive: vi.fn(),
    listPriceFrom: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(
    fn: T,
    keyParts?: string[],
    options?: { tags?: string[]; revalidate?: number | false },
  ): T => {
    mocks.cacheCalls.push({ keyParts, options });
    return fn;
  },
}));

vi.mock('@/lib/database/repositories/products', () => ({
  productsRepository: mocks.productsRepository,
}));

vi.mock('@/lib/database/repositories/categories', () => ({
  categoryRepository: mocks.categoryRepository,
}));

import { getProductBySlug } from './getProductBySlug';

function productRow(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: 'p1',
    categoryId: 'cat-active',
    name: 'Ramo de Rosas',
    slug: 'ramo-de-rosas',
    description: 'Un ramo hermoso',
    price: 120,
    imageUrl: 'https://x/p1.jpg',
    images: [],
    includes: [],
    colors: [],
    flowerTypes: [],
    occasion: null,
    note: null,
    priceVariants: null,
    displayOrder: 1,
    isActive: true,
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    colorAssignments: [],
    flowerTypeAssignments: [],
    productImages: [],
    ...overrides,
  };
}

function activeCategory(id: string, slug: string) {
  return {
    id,
    name: slug,
    slug,
    description: '',
    occasion: null,
    imageUrl: null,
    isFeatured: false,
  };
}

describe('getProductBySlug', () => {
  beforeEach(() => {
    mocks.productsRepository.findActiveJoinedBySlug.mockReset();
    mocks.productsRepository.listActiveJoined.mockReset();
    mocks.categoryRepository.listActive.mockReset();
    mocks.categoryRepository.listPriceFrom.mockReset();
    mocks.categoryRepository.listActive.mockResolvedValue([activeCategory('cat-active', 'rosas')]);
    mocks.categoryRepository.listPriceFrom.mockResolvedValue(new Map());
  });

  it('caches the per-slug lookup under the catalog-products tag', () => {
    expect(mocks.cacheCalls).toContainEqual({
      keyParts: ['catalog-product'],
      options: { tags: ['catalog-products'], revalidate: 3600 },
    });
  });

  it('returns the mapped product when its category is active', async () => {
    mocks.productsRepository.findActiveJoinedBySlug.mockResolvedValue(productRow());

    const product = await getProductBySlug('ramo-de-rosas');

    expect(mocks.productsRepository.findActiveJoinedBySlug).toHaveBeenCalledWith('ramo-de-rosas');
    expect(product?.id).toBe('p1');
    expect(product?.categoryId).toBe('cat-active');
  });

  it('returns null when the product belongs to an inactive category', async () => {
    mocks.productsRepository.findActiveJoinedBySlug.mockResolvedValue(
      productRow({ categoryId: 'cat-inactive' }),
    );

    await expect(getProductBySlug('ramo-de-rosas')).resolves.toBeNull();
  });

  it('returns null when no active product matches the slug', async () => {
    mocks.productsRepository.findActiveJoinedBySlug.mockResolvedValue(null);

    await expect(getProductBySlug('missing')).resolves.toBeNull();
  });

  it('never scans the whole catalog', async () => {
    mocks.productsRepository.findActiveJoinedBySlug.mockResolvedValue(productRow());

    await getProductBySlug('ramo-de-rosas');

    expect(mocks.productsRepository.listActiveJoined).not.toHaveBeenCalled();
  });
});
