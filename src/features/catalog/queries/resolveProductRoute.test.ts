import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product as ProductRow } from '@/lib/database/repositories/products';

const mocks = vi.hoisted(() => ({
  productsRepository: {
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

import { resolveProductRoute } from './resolveProductRoute';

function productRow(categoryId: string): ProductRow {
  return {
    id: 'p1',
    categoryId,
    name: 'Ramo de Rosas',
    slug: 'ramo-de-rosas',
    description: '',
    price: 100,
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

describe('resolveProductRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.categoryRepository.listActive.mockResolvedValue([
      activeCategory('cat-rosas', 'rosas'),
      activeCategory('cat-tulipanes', 'tulipanes'),
    ]);
    mocks.categoryRepository.listPriceFrom.mockResolvedValue(new Map());
    mocks.productsRepository.findActiveJoinedBySlug.mockResolvedValue(productRow('cat-rosas'));
  });

  it('resolves the category and product when both match', async () => {
    const route = await resolveProductRoute('rosas', 'ramo-de-rosas');

    expect(route?.category.id).toBe('cat-rosas');
    expect(route?.product.id).toBe('p1');
  });

  it.each([
    ['an uppercase categoria', 'Rosas', 'ramo-de-rosas'],
    ['an uppercase slug', 'rosas', 'Ramo'],
    ['an encoded slug', 'rosas', 'ramo%20de'],
    ['an empty slug', 'rosas', ''],
    ['an oversized categoria', 'a'.repeat(121), 'ramo-de-rosas'],
    ['an oversized slug', 'rosas', 'a'.repeat(121)],
  ])('returns null for %s before any repository call', async (_label, categoria, slug) => {
    await expect(resolveProductRoute(categoria, slug)).resolves.toBeNull();

    expect(mocks.categoryRepository.listActive).not.toHaveBeenCalled();
    expect(mocks.productsRepository.findActiveJoinedBySlug).not.toHaveBeenCalled();
  });

  it('returns null without a product lookup when the categoria is not an active category', async () => {
    await expect(resolveProductRoute('girasoles', 'ramo-de-rosas')).resolves.toBeNull();

    expect(mocks.productsRepository.findActiveJoinedBySlug).not.toHaveBeenCalled();
  });

  it('returns null when the product belongs to a different category than the route', async () => {
    await expect(resolveProductRoute('tulipanes', 'ramo-de-rosas')).resolves.toBeNull();
  });

  it('returns null when the product category is inactive', async () => {
    mocks.productsRepository.findActiveJoinedBySlug.mockResolvedValue(productRow('cat-inactive'));

    await expect(resolveProductRoute('rosas', 'ramo-de-rosas')).resolves.toBeNull();
  });
});
