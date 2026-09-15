import { describe, expect, it } from 'vitest';

import type { ProductDocRecord, RelatedData } from './mappers';
import { deriveProductImages, parsePriceVariants, toProduct } from './mappers';
import type { ProductImage } from './types';

function image(overrides: Partial<ProductImage> = {}): ProductImage {
  return {
    id: overrides.id ?? 'img-1',
    url: overrides.url ?? 'https://x/img-1.jpg',
    altText: overrides.altText ?? null,
    isPrimary: overrides.isPrimary ?? false,
    displayOrder: overrides.displayOrder ?? 0,
  };
}

function emptyRelated(): RelatedData {
  return {
    colorAssignmentsByProduct: new Map(),
    flowerAssignmentsByProduct: new Map(),
    imagesByProduct: new Map(),
  };
}

function baseDoc(overrides: Partial<ProductDocRecord> = {}): ProductDocRecord {
  return {
    id: overrides.id ?? 'p1',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-02T00:00:00.000Z',
    category_id: overrides.category_id ?? 'cat-1',
    name: overrides.name ?? 'Ramo de Rosas',
    slug: overrides.slug ?? 'ramo-de-rosas',
    description: overrides.description ?? 'Un ramo hermoso',
    price: overrides.price ?? 120,
    includes: overrides.includes ?? ['tarjeta'],
    occasion: overrides.occasion ?? null,
    note: overrides.note ?? null,
    price_variants: overrides.price_variants ?? null,
    display_order: overrides.display_order ?? 1,
    is_active: overrides.is_active ?? true,
    is_featured: overrides.is_featured ?? false,
  };
}

describe('deriveProductImages', () => {
  it('returns an empty url and gallery when there are no images', () => {
    expect(deriveProductImages([])).toEqual({ imageUrl: '', gallery: [] });
  });

  it('picks the image flagged as primary regardless of order', () => {
    const images = [
      image({ id: 'a', url: 'https://x/a.jpg', displayOrder: 0, isPrimary: false }),
      image({ id: 'b', url: 'https://x/b.jpg', displayOrder: 1, isPrimary: true }),
    ];

    expect(deriveProductImages(images)).toEqual({
      imageUrl: 'https://x/b.jpg',
      gallery: ['https://x/a.jpg'],
    });
  });

  it('falls back to the first image (by displayOrder) when none is primary, keeping it in the gallery too', () => {
    const images = [
      image({ id: 'b', url: 'https://x/b.jpg', displayOrder: 1 }),
      image({ id: 'a', url: 'https://x/a.jpg', displayOrder: 0 }),
    ];

    expect(deriveProductImages(images)).toEqual({
      imageUrl: 'https://x/a.jpg',
      gallery: ['https://x/a.jpg', 'https://x/b.jpg'],
    });
  });

  it('sorts the gallery by displayOrder and excludes the primary image', () => {
    const images = [
      image({ id: 'c', url: 'https://x/c.jpg', displayOrder: 2 }),
      image({ id: 'primary', url: 'https://x/primary.jpg', displayOrder: 0, isPrimary: true }),
      image({ id: 'b', url: 'https://x/b.jpg', displayOrder: 1 }),
    ];

    expect(deriveProductImages(images)).toEqual({
      imageUrl: 'https://x/primary.jpg',
      gallery: ['https://x/b.jpg', 'https://x/c.jpg'],
    });
  });
});

describe('parsePriceVariants', () => {
  it('returns null when the stored value is null', () => {
    expect(parsePriceVariants(null)).toBeNull();
  });

  it('parses a JSON-encoded array of valid price variants', () => {
    const stored = JSON.stringify([{ label: 'Chico', price: 80 }, { label: 'Grande', price: 150 }]);

    expect(parsePriceVariants(stored)).toEqual([
      { label: 'Chico', price: 80 },
      { label: 'Grande', price: 150 },
    ]);
  });

  it('returns null when the stored value is not valid JSON', () => {
    expect(parsePriceVariants('{not-json')).toBeNull();
  });

  it('returns null when the parsed JSON is not an array', () => {
    expect(parsePriceVariants(JSON.stringify({ label: 'Chico', price: 80 }))).toBeNull();
  });

  it('returns null when an array entry is not a valid price variant', () => {
    const stored = JSON.stringify([{ label: 'Chico', price: 80 }, { label: 'Grande' }]);

    expect(parsePriceVariants(stored)).toBeNull();
  });
});

describe('toProduct', () => {
  it('maps a bare document with no related data to a Product with empty collections', () => {
    const doc = baseDoc();

    const result = toProduct(doc, emptyRelated());

    expect(result).toEqual({
      id: 'p1',
      categoryId: 'cat-1',
      name: 'Ramo de Rosas',
      slug: 'ramo-de-rosas',
      description: 'Un ramo hermoso',
      price: 120,
      imageUrl: '',
      images: [],
      includes: ['tarjeta'],
      colors: [],
      flowerTypes: [],
      occasion: null,
      note: null,
      priceVariants: null,
      displayOrder: 1,
      isActive: true,
      isFeatured: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      colorAssignments: [],
      flowerTypeAssignments: [],
      productImages: [],
    });
  });

  it('derives imageUrl/images and colors/flowerTypes from the related maps', () => {
    const doc = baseDoc({ id: 'p1', price_variants: JSON.stringify([{ label: 'Único', price: 99 }]) });
    const related: RelatedData = {
      colorAssignmentsByProduct: new Map([
        ['p1', [{ colorId: 'c1', color: { id: 'c1', name: 'rojo', hex: '#f00', label: 'Rojo' } }]],
      ]),
      flowerAssignmentsByProduct: new Map([
        ['p1', [{ flowerTypeId: 'f1', flowerType: { id: 'f1', name: 'rosa' } }]],
      ]),
      imagesByProduct: new Map([
        ['p1', [image({ id: 'i1', url: 'https://x/i1.jpg', isPrimary: true, displayOrder: 0 })]],
      ]),
    };

    const result = toProduct(doc, related);

    expect(result.imageUrl).toBe('https://x/i1.jpg');
    expect(result.images).toEqual([]);
    expect(result.colors).toEqual(['rojo']);
    expect(result.flowerTypes).toEqual(['rosa']);
    expect(result.priceVariants).toEqual([{ label: 'Único', price: 99 }]);
  });

  it('drops orphaned assignments from colors/flowerTypes but keeps them in the raw assignment lists', () => {
    const doc = baseDoc({ id: 'p1' });
    const related: RelatedData = {
      colorAssignmentsByProduct: new Map([['p1', [{ colorId: 'deleted-color', color: null }]]]),
      flowerAssignmentsByProduct: new Map([
        ['p1', [{ flowerTypeId: 'deleted-flower', flowerType: null }]],
      ]),
      imagesByProduct: new Map(),
    };

    const result = toProduct(doc, related);

    expect(result.colors).toEqual([]);
    expect(result.flowerTypes).toEqual([]);
    expect(result.colorAssignments).toEqual([{ colorId: 'deleted-color', color: null }]);
    expect(result.flowerTypeAssignments).toEqual([{ flowerTypeId: 'deleted-flower', flowerType: null }]);
  });
});
