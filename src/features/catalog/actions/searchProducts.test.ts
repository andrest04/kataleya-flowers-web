import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product as ProductRow } from '@/lib/database/repositories/products';

const mocks = vi.hoisted(() => ({
  productsRepository: {
    listActiveJoined: vi.fn(),
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

import { searchProducts } from './searchProducts';

function productRow(id: string, name: string, overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id,
    categoryId: 'cat-rosas',
    name,
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

describe('searchProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.categoryRepository.listActive.mockResolvedValue([
      {
        id: 'cat-rosas',
        name: 'Rosas',
        slug: 'rosas',
        description: '',
        occasion: null,
        imageUrl: null,
        isFeatured: false,
      },
    ]);
    mocks.categoryRepository.listPriceFrom.mockResolvedValue(new Map());
    mocks.productsRepository.listActiveJoined.mockResolvedValue([]);
  });

  it.each([
    ['a number', 42],
    ['an object', { toString: () => 'rosa' }],
    ['null', null],
    ['an empty string', '   '],
    ['a 1 MB string', 'a'.repeat(1024 * 1024)],
    ['a 101-character string', 'a'.repeat(101)],
  ])('returns [] for %s without reading the catalog', async (_label, input) => {
    await expect(searchProducts(input)).resolves.toEqual([]);

    expect(mocks.productsRepository.listActiveJoined).not.toHaveBeenCalled();
    expect(mocks.categoryRepository.listActive).not.toHaveBeenCalled();
  });

  it('filters the cached catalog by name, case-insensitively, and maps search results', async () => {
    mocks.productsRepository.listActiveJoined.mockResolvedValue([
      productRow('p1', 'Ramo de Rosas', {
        priceVariants: [{ label: 'Grande', price: 200 }],
      }),
      productRow('p2', 'Caja de Tulipanes'),
    ]);

    const results = await searchProducts('  ROSAS ');

    expect(results).toEqual([
      {
        name: 'Ramo de Rosas',
        slug: 'producto-p1',
        categorySlug: 'rosas',
        categoryName: 'Rosas',
        price: 100,
        hasVariants: true,
        imageUrl: 'https://x/p1.jpg',
      },
    ]);
  });

  it('caps the results at 12', async () => {
    mocks.productsRepository.listActiveJoined.mockResolvedValue(
      Array.from({ length: 20 }, (_, index) => productRow(`p${index}`, `Rosa ${index}`)),
    );

    const results = await searchProducts('rosa');

    expect(results).toHaveLength(12);
    expect(results[0].name).toBe('Rosa 0');
  });
});
