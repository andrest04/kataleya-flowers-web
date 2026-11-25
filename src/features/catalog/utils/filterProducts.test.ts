import { describe, expect, it } from 'vitest';

import type { Product } from '@/features/catalog/types';

import { filterProducts, type ProductFilters } from './filterProducts';

function makeProduct(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name: `Producto ${id}`,
    slug: `producto-${id}`,
    description: 'Arreglo floral.',
    price: 100,
    categoryId: 'cat-rosas',
    imageUrl: `/images/${id}.jpg`,
    images: [],
    colors: ['rojo'],
    flowerTypes: ['rosa'],
    ...overrides,
  };
}

const entries = [
  { product: makeProduct('a', { price: 50, colors: ['rojo'], flowerTypes: ['rosa'] }), categorySlug: 'rosas' },
  {
    product: makeProduct('b', {
      price: 300,
      priceTable: [
        { label: 'S', price: 120 },
        { label: 'L', price: 260 },
      ],
      colors: ['blanco'],
      flowerTypes: ['tulipan'],
      description: 'Ideal para aniversario.',
    }),
    categorySlug: 'tulipanes',
  },
  {
    product: makeProduct('c', {
      price: 500,
      colors: ['rosado'],
      flowerTypes: ['orquidea'],
      includes: ['Chocolates'],
      occasion: 'Cumpleaños',
    }),
    categorySlug: 'orquideas',
  },
];

const noFilters: ProductFilters = {
  q: '',
  categorySlugs: [],
  priceMin: 0,
  priceMax: 1000,
  colors: [],
  flowerTypes: [],
};

function ids(result: { product: { id: string } }[]): string[] {
  return result.map(({ product }) => product.id);
}

describe('filterProducts', () => {
  it('returns every entry when no filter is active', () => {
    expect(ids(filterProducts(entries, noFilters))).toEqual(['a', 'b', 'c']);
  });

  it('matches any of several selected categories', () => {
    const result = filterProducts(entries, { ...noFilters, categorySlugs: ['rosas', 'orquideas'] });
    expect(ids(result)).toEqual(['a', 'c']);
  });

  it('keeps single-category selection exact', () => {
    expect(ids(filterProducts(entries, { ...noFilters, categorySlugs: ['tulipanes'] }))).toEqual(['b']);
  });

  it('bounds price by the priceTable minimum', () => {
    const result = filterProducts(entries, { ...noFilters, priceMin: 100, priceMax: 150 });
    expect(ids(result)).toEqual(['b']);
  });

  it('matches q against name, description, includes and occasion', () => {
    expect(ids(filterProducts(entries, { ...noFilters, q: '  ANIVERSARIO ' }))).toEqual(['b']);
    expect(ids(filterProducts(entries, { ...noFilters, q: 'chocolates' }))).toEqual(['c']);
    expect(ids(filterProducts(entries, { ...noFilters, q: 'cumpleaños' }))).toEqual(['c']);
    expect(ids(filterProducts(entries, { ...noFilters, q: 'producto a' }))).toEqual(['a']);
  });

  it('treats an omitted q as no search', () => {
    const withoutQuery: ProductFilters = {
      categorySlugs: [],
      priceMin: 0,
      priceMax: 1000,
      colors: [],
      flowerTypes: [],
    };
    expect(ids(filterProducts(entries, withoutQuery))).toEqual(['a', 'b', 'c']);
  });

  it('matches any selected color and flower type', () => {
    expect(ids(filterProducts(entries, { ...noFilters, colors: ['blanco', 'rosado'] }))).toEqual(['b', 'c']);
    expect(ids(filterProducts(entries, { ...noFilters, flowerTypes: ['rosa'] }))).toEqual(['a']);
  });

  describe('facet exclusion', () => {
    const narrowed: ProductFilters = {
      ...noFilters,
      categorySlugs: ['rosas'],
      priceMin: 40,
      priceMax: 60,
      colors: ['rojo'],
      flowerTypes: ['rosa'],
    };

    it('ignores the category filter when except is category', () => {
      const result = filterProducts(entries, { ...narrowed, categorySlugs: ['orquideas'] }, 'category');
      expect(ids(result)).toEqual(['a']);
    });

    it('ignores the price filter when except is price', () => {
      const result = filterProducts(entries, { ...narrowed, priceMin: 400, priceMax: 600 }, 'price');
      expect(ids(result)).toEqual(['a']);
    });

    it('ignores the color filter when except is colors', () => {
      const result = filterProducts(entries, { ...narrowed, colors: ['blanco'] }, 'colors');
      expect(ids(result)).toEqual(['a']);
    });

    it('ignores the flower type filter when except is flowerTypes', () => {
      const result = filterProducts(entries, { ...narrowed, flowerTypes: ['tulipan'] }, 'flowerTypes');
      expect(ids(result)).toEqual(['a']);
    });

    it('still applies every other facet', () => {
      const result = filterProducts(
        entries,
        { ...noFilters, categorySlugs: ['tulipanes'], colors: ['rojo'] },
        'flowerTypes',
      );
      expect(result).toEqual([]);
    });
  });
});
