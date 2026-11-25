import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product as ProductRow } from '@/lib/database/repositories/products';

const mocks = vi.hoisted(() => ({
  productsRepository: {
    listActiveJoined: vi.fn(),
    findActiveJoinedBySlug: vi.fn(),
  },
  categoryRepository: {
    listActive: vi.fn(),
    listPriceFrom: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: <T,>(fn: T): T => fn,
}));

vi.mock('@/lib/database/repositories/products', () => ({
  productsRepository: mocks.productsRepository,
}));

vi.mock('@/lib/database/repositories/categories', () => ({
  categoryRepository: mocks.categoryRepository,
}));

import { getProductsByCategory } from './getProductsByCategory';

function productRow(id: string, categoryId: string, displayOrder: number): ProductRow {
  return {
    id,
    categoryId,
    name: `Producto ${id}`,
    slug: `producto-${id}`,
    description: '',
    price: 100,
    imageUrl: `https://x/${id}.jpg`,
    images: [],
    includes: [],
    colors: [],
    flowerTypes: [],
    occasion: null,
    note: null,
    priceVariants: null,
    displayOrder,
    isActive: true,
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    colorAssignments: [],
    flowerTypeAssignments: [],
    productImages: [],
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

describe('getProductsByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.categoryRepository.listActive.mockResolvedValue([
      activeCategory('cat-rosas', 'rosas'),
      activeCategory('cat-tulipanes', 'tulipanes'),
    ]);
    mocks.categoryRepository.listPriceFrom.mockResolvedValue(new Map());
    mocks.productsRepository.listActiveJoined.mockResolvedValue([
      productRow('p1', 'cat-rosas', 1),
      productRow('p2', 'cat-tulipanes', 2),
      productRow('p3', 'cat-rosas', 3),
    ]);
  });

  it('filters the cached catalog by the category matching the slug, keeping catalog order', async () => {
    const products = await getProductsByCategory('rosas');

    expect(products.map((product) => product.id)).toEqual(['p1', 'p3']);
  });

  it('returns an empty list when the slug matches no active category', async () => {
    await expect(getProductsByCategory('missing')).resolves.toEqual([]);
  });

  it('reads only the cached catalog and categories', async () => {
    await getProductsByCategory('rosas');

    expect(mocks.productsRepository.listActiveJoined).toHaveBeenCalledTimes(1);
    expect(mocks.categoryRepository.listActive).toHaveBeenCalledTimes(1);
    expect(mocks.productsRepository.findActiveJoinedBySlug).not.toHaveBeenCalled();
  });
});
