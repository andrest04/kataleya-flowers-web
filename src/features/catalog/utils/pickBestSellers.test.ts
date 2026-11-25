import { describe, expect, it } from 'vitest';

import type { Product } from '@/features/catalog/types';

import {
  BEST_SELLERS_ALL_TAB,
  buildBestSellersByTab,
  pickBestSellerCards,
  pickBestSellers,
} from './pickBestSellers';

function makeProduct(id: string, categoryId: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name: `Producto ${id}`,
    slug: `producto-${id}`,
    description: 'Una descripción larga del arreglo floral.',
    price: 100,
    categoryId,
    imageUrl: `/images/${id}.jpg`,
    images: [`/images/${id}-1.jpg`, `/images/${id}-2.jpg`],
    includes: ['Tarjeta'],
    occasion: 'Cumpleaños',
    note: 'Nota interna',
    colors: ['rojo'],
    flowerTypes: ['rosa'],
    ...overrides,
  };
}

const roses = Array.from({ length: 6 }, (_, index) => makeProduct(`r${index}`, 'rosas'));
const orchids = [
  makeProduct('o0', 'orquideas'),
  makeProduct('o1', 'orquideas', { isFeatured: true }),
];
const products = [...roses, ...orchids];
const tabCategories = [{ id: 'rosas' }, { id: 'orquideas' }];

describe('pickBestSellers', () => {
  it('prefers featured products', () => {
    expect(pickBestSellers(orchids).map(({ id }) => id)).toEqual(['o1']);
  });

  it('falls back to the first products when none are featured', () => {
    expect(pickBestSellers(roses).map(({ id }) => id)).toEqual(['r0', 'r1', 'r2', 'r3']);
  });
});

describe('pickBestSellerCards', () => {
  it('returns at most four slim card products without detail-only fields', () => {
    const cards = pickBestSellerCards(roses);

    expect(cards.map(({ id }) => id)).toEqual(['r0', 'r1', 'r2', 'r3']);
    for (const card of cards) {
      for (const key of ['description', 'images', 'includes', 'note', 'occasion']) {
        expect(card).not.toHaveProperty(key);
      }
    }
  });

  it('prefers featured products', () => {
    expect(pickBestSellerCards(products).map(({ id }) => id)).toEqual(['o1']);
  });
});

describe('buildBestSellersByTab', () => {
  it('includes the all tab and one entry per tab category', () => {
    const byTab = buildBestSellersByTab(products, tabCategories);

    expect(Object.keys(byTab).sort()).toEqual([BEST_SELLERS_ALL_TAB, 'orquideas', 'rosas'].sort());
  });

  it('keeps at most four products per tab', () => {
    const byTab = buildBestSellersByTab(products, tabCategories);

    for (const tabProducts of Object.values(byTab)) {
      expect(tabProducts.length).toBeLessThanOrEqual(4);
    }
    expect(byTab[BEST_SELLERS_ALL_TAB].map(({ id }) => id)).toEqual(['o1']);
    expect(byTab.rosas.map(({ id }) => id)).toEqual(['r0', 'r1', 'r2', 'r3']);
    expect(byTab.orquideas.map(({ id }) => id)).toEqual(['o1']);
  });

  it('returns slim card products without detail-only fields', () => {
    const byTab = buildBestSellersByTab(products, tabCategories);
    const card = byTab.rosas[0];

    for (const key of ['description', 'images', 'includes', 'note', 'occasion']) {
      expect(card).not.toHaveProperty(key);
    }
    expect(card).toMatchObject({
      id: 'r0',
      name: 'Producto r0',
      slug: 'producto-r0',
      categoryId: 'rosas',
      imageUrl: '/images/r0.jpg',
      price: 100,
      colors: ['rojo'],
      flowerTypes: ['rosa'],
    });
  });

  it('returns an empty list for a tab category without products', () => {
    const byTab = buildBestSellersByTab(products, [...tabCategories, { id: 'girasoles' }]);

    expect(byTab.girasoles).toEqual([]);
  });
});
