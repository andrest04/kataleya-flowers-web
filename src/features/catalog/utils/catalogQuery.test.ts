import { describe, expect, it } from 'vitest';

import {
  catalogCardSizes,
  type CatalogQueryFacets,
  type CatalogQueryState,
  parseCatalogQuery,
  serializeCatalogQuery,
} from './catalogQuery';

const facets: CatalogQueryFacets = {
  categorySlugs: new Set(['rosas', 'girasoles']),
  colors: new Set(['rojo', 'blanco']),
  flowerTypes: new Set(['tulipan', 'lirio']),
  maximumPrice: 300,
};

const defaultState: CatalogQueryState = {
  filters: { category: [], priceMin: 0, priceMax: 300, colors: [], flowerTypes: [] },
  sort: 'featured',
  density: 3,
};

describe('parseCatalogQuery', () => {
  it('returns the defaults for an empty search', () => {
    expect(parseCatalogQuery('', facets)).toEqual(defaultState);
  });

  it('parses every supported parameter', () => {
    const search =
      '?categoria=rosas,girasoles&precio_min=50&precio_max=200&color=rojo&tipo=lirio&orden=price-asc&densidad=2';

    expect(parseCatalogQuery(search, facets)).toEqual({
      filters: {
        category: ['rosas', 'girasoles'],
        priceMin: 50,
        priceMax: 200,
        colors: ['rojo'],
        flowerTypes: ['lirio'],
      },
      sort: 'price-asc',
      density: 2,
    });
  });

  it('accepts a search without the leading question mark', () => {
    expect(parseCatalogQuery('color=blanco', facets).filters.colors).toEqual(['blanco']);
  });

  it('drops unknown categories, colors and flower types', () => {
    const state = parseCatalogQuery('?categoria=cactus,rosas&color=verde&tipo=orquidea', facets);

    expect(state.filters.category).toEqual(['rosas']);
    expect(state.filters.colors).toEqual([]);
    expect(state.filters.flowerTypes).toEqual([]);
  });

  it('falls back to the defaults for a NaN price, an unknown sort and density 5', () => {
    const state = parseCatalogQuery(
      '?precio_min=abc&precio_max=NaN&orden=random&densidad=5',
      facets,
    );

    expect(state).toEqual(defaultState);
  });

  it('clamps prices to the range between zero and the maximum price', () => {
    const state = parseCatalogQuery('?precio_min=-20&precio_max=900', facets);

    expect(state.filters.priceMin).toBe(0);
    expect(state.filters.priceMax).toBe(300);
  });
});

describe('serializeCatalogQuery', () => {
  it('returns an empty query for the default state', () => {
    expect(serializeCatalogQuery(defaultState, 300)).toBe('');
  });

  it('round trips a non-default state', () => {
    const state: CatalogQueryState = {
      filters: {
        category: ['rosas'],
        priceMin: 20,
        priceMax: 150,
        colors: ['rojo', 'blanco'],
        flowerTypes: ['tulipan'],
      },
      sort: 'name-asc',
      density: 4,
    };

    expect(parseCatalogQuery(serializeCatalogQuery(state, 300), facets)).toEqual(state);
  });

  it('keeps unrelated parameters from the current search', () => {
    const query = serializeCatalogQuery(
      { ...defaultState, sort: 'price-desc' },
      300,
      '?campaign=summer&color=rojo',
    );
    const params = new URLSearchParams(query);

    expect(params.get('campaign')).toBe('summer');
    expect(params.get('orden')).toBe('price-desc');
    expect(params.has('color')).toBe(false);
  });

  it('omits the maximum price when it equals the maximum', () => {
    const query = serializeCatalogQuery(
      { ...defaultState, filters: { ...defaultState.filters, priceMin: 10 } },
      300,
    );

    expect(query).toBe('precio_min=10');
  });
});

describe('catalogCardSizes', () => {
  it.each([
    [2, '50vw'],
    [3, '33vw'],
    [4, '25vw'],
  ] as const)('uses %s columns on desktop as %s', (density, desktop) => {
    expect(catalogCardSizes(density)).toBe(
      `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${desktop}`,
    );
  });
});
