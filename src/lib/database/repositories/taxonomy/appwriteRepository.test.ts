import { beforeEach, describe, expect, it } from 'vitest';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';

import { createTaxonomyRepository } from './appwriteRepository';
import type { ColorRepoRow, FlowerTypeRepoRow, TaxonomyRepository } from './types';

const C = APPWRITE_COLLECTIONS;

function seedColor(store: FakeDocumentStore, overrides: Partial<ColorRepoRow> = {}): ColorRepoRow {
  const doc: ColorRepoRow = {
    id: overrides.id ?? 'color-1',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    name: overrides.name ?? 'rojo',
    label: overrides.label ?? 'Rojo',
    hex: overrides.hex ?? '#ff0000',
    display_order: overrides.display_order ?? 1,
  };
  store.seed(C.colors, doc);
  return doc;
}

function seedFlowerType(
  store: FakeDocumentStore,
  overrides: Partial<FlowerTypeRepoRow> = {},
): FlowerTypeRepoRow {
  const doc: FlowerTypeRepoRow = {
    id: overrides.id ?? 'flower-1',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    name: overrides.name ?? 'rosa',
    display_order: overrides.display_order ?? 1,
  };
  store.seed(C.flowerTypes, doc);
  return doc;
}

function seedProduct(store: FakeDocumentStore, id: string, name: string): void {
  store.seed(C.products, {
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name,
  });
}

describe('createTaxonomyRepository', () => {
  let store: FakeDocumentStore;
  let repository: TaxonomyRepository;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createTaxonomyRepository(store);
  });

  describe('listColors', () => {
    it('returns colors ordered by display_order ascending', async () => {
      seedColor(store, { id: 'c2', name: 'azul', display_order: 2 });
      seedColor(store, { id: 'c1', name: 'rojo', display_order: 1 });

      const result = await repository.listColors();

      expect(result.map((c) => c.id)).toEqual(['c1', 'c2']);
    });

    it('returns an empty array when there are no colors', async () => {
      await expect(repository.listColors()).resolves.toEqual([]);
    });
  });

  describe('listFlowerTypes', () => {
    it('returns flower types ordered by display_order ascending', async () => {
      seedFlowerType(store, { id: 'f2', name: 'tulipan', display_order: 2 });
      seedFlowerType(store, { id: 'f1', name: 'rosa', display_order: 1 });

      const result = await repository.listFlowerTypes();

      expect(result.map((f) => f.id)).toEqual(['f1', 'f2']);
    });
  });

  describe('getColorUsage', () => {
    it('returns an empty array when the color does not exist', async () => {
      await expect(repository.getColorUsage('missing')).resolves.toEqual([]);
    });

    it('returns an empty array when the color has no assignments', async () => {
      seedColor(store, { name: 'rojo' });

      await expect(repository.getColorUsage('rojo')).resolves.toEqual([]);
    });

    it('resolves the product names assigned to the color', async () => {
      seedColor(store, { id: 'color-1', name: 'rojo' });
      seedProduct(store, 'p1', 'Ramo Rojo');
      seedProduct(store, 'p2', 'Caja Roja');
      store.seed(C.colorAssignments, {
        id: 'a1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p1',
        color_id: 'color-1',
      });
      store.seed(C.colorAssignments, {
        id: 'a2',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p2',
        color_id: 'color-1',
      });

      const result = await repository.getColorUsage('rojo');

      expect(result).toEqual(
        expect.arrayContaining([
          { product_id: 'p1', product_name: 'Ramo Rojo' },
          { product_id: 'p2', product_name: 'Caja Roja' },
        ]),
      );
      expect(result).toHaveLength(2);
    });

    it('skips an assignment whose product no longer exists', async () => {
      seedColor(store, { id: 'color-1', name: 'rojo' });
      seedProduct(store, 'p1', 'Ramo Rojo');
      store.seed(C.colorAssignments, {
        id: 'a1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p1',
        color_id: 'color-1',
      });
      store.seed(C.colorAssignments, {
        id: 'a2',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'deleted-product',
        color_id: 'color-1',
      });

      const result = await repository.getColorUsage('rojo');

      expect(result).toEqual([{ product_id: 'p1', product_name: 'Ramo Rojo' }]);
    });
  });

  describe('getFlowerTypeUsage', () => {
    it('returns an empty array when the flower type does not exist', async () => {
      await expect(repository.getFlowerTypeUsage('missing')).resolves.toEqual([]);
    });

    it('resolves the product names assigned to the flower type', async () => {
      seedFlowerType(store, { id: 'flower-1', name: 'rosa' });
      seedProduct(store, 'p1', 'Ramo de Rosas');
      store.seed(C.flowerTypeAssignments, {
        id: 'a1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        product_id: 'p1',
        flower_type_id: 'flower-1',
      });

      const result = await repository.getFlowerTypeUsage('rosa');

      expect(result).toEqual([{ product_id: 'p1', product_name: 'Ramo de Rosas' }]);
    });
  });

  describe('ensureColors', () => {
    it('does nothing when given an empty list', async () => {
      await repository.ensureColors([]);

      await expect(repository.listColors()).resolves.toEqual([]);
    });

    it('creates colors that do not exist yet, normalizing name and label', async () => {
      await repository.ensureColors([{ name: 'ROJO', hex: '#ff0000' }]);

      const result = await repository.listColors();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ name: 'rojo', label: 'Rojo', hex: '#ff0000', display_order: 1 });
    });

    it('skips colors that already exist (case-insensitive, trimmed)', async () => {
      seedColor(store, { name: 'rojo', display_order: 1 });

      await repository.ensureColors([{ name: ' Rojo ', hex: '#ff0000' }]);

      await expect(repository.listColors()).resolves.toHaveLength(1);
    });

    it('assigns increasing display_order continuing from the current max', async () => {
      seedColor(store, { id: 'c1', name: 'rojo', display_order: 5 });

      await repository.ensureColors([
        { name: 'azul', hex: '#0000ff' },
        { name: 'verde', hex: '#00ff00' },
      ]);

      const result = await repository.listColors();
      const azul = result.find((c) => c.name === 'azul');
      const verde = result.find((c) => c.name === 'verde');
      expect(azul?.display_order).toBe(6);
      expect(verde?.display_order).toBe(7);
    });

    it('stores null hex when an empty hex is given', async () => {
      await repository.ensureColors([{ name: 'negro', hex: '' }]);

      const result = await repository.listColors();
      expect(result[0].hex).toBeNull();
    });
  });

  describe('ensureFlowerTypes', () => {
    it('does nothing when given an empty list', async () => {
      await repository.ensureFlowerTypes([]);

      await expect(repository.listFlowerTypes()).resolves.toEqual([]);
    });

    it('creates flower types that do not exist yet, normalizing the name', async () => {
      await repository.ensureFlowerTypes(['  ROSA  ']);

      const result = await repository.listFlowerTypes();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ name: 'rosa', display_order: 1 });
    });

    it('skips flower types that already exist (case-insensitive, trimmed)', async () => {
      seedFlowerType(store, { name: 'rosa', display_order: 1 });

      await repository.ensureFlowerTypes([' Rosa ']);

      await expect(repository.listFlowerTypes()).resolves.toHaveLength(1);
    });
  });

  describe('deleteColor', () => {
    it('deletes an existing color and returns true', async () => {
      seedColor(store, { id: 'color-1', name: 'rojo' });

      await expect(repository.deleteColor('rojo')).resolves.toBe(true);
      await expect(repository.listColors()).resolves.toEqual([]);
    });

    it('returns false when the color does not exist', async () => {
      await expect(repository.deleteColor('missing')).resolves.toBe(false);
    });
  });

  describe('renameColor', () => {
    it('renames the color and returns null on success', async () => {
      seedColor(store, { id: 'color-1', name: 'rojo' });

      const result = await repository.renameColor('rojo', 'Escarlata');

      expect(result).toBeNull();
      const colors = await repository.listColors();
      expect(colors[0].name).toBe('escarlata');
    });

    it('returns not_found when the original color does not exist', async () => {
      await expect(repository.renameColor('missing', 'nuevo')).resolves.toBe('not_found');
    });

    it('returns duplicate when the new name is already taken', async () => {
      seedColor(store, { id: 'color-1', name: 'rojo' });
      seedColor(store, { id: 'color-2', name: 'azul' });

      await expect(repository.renameColor('rojo', 'azul')).resolves.toBe('duplicate');
    });
  });

  describe('deleteFlowerType', () => {
    it('deletes an existing flower type and returns true', async () => {
      seedFlowerType(store, { id: 'flower-1', name: 'rosa' });

      await expect(repository.deleteFlowerType('rosa')).resolves.toBe(true);
      await expect(repository.listFlowerTypes()).resolves.toEqual([]);
    });

    it('returns false when the flower type does not exist', async () => {
      await expect(repository.deleteFlowerType('missing')).resolves.toBe(false);
    });
  });

  describe('renameFlowerType', () => {
    it('renames the flower type and returns null on success', async () => {
      seedFlowerType(store, { id: 'flower-1', name: 'rosa' });

      const result = await repository.renameFlowerType('rosa', 'Peonia');

      expect(result).toBeNull();
      const flowerTypes = await repository.listFlowerTypes();
      expect(flowerTypes[0].name).toBe('peonia');
    });

    it('returns not_found when the original flower type does not exist', async () => {
      await expect(repository.renameFlowerType('missing', 'nuevo')).resolves.toBe('not_found');
    });

    it('returns duplicate when the new name is already taken', async () => {
      seedFlowerType(store, { id: 'flower-1', name: 'rosa' });
      seedFlowerType(store, { id: 'flower-2', name: 'tulipan' });

      await expect(repository.renameFlowerType('rosa', 'tulipan')).resolves.toBe('duplicate');
    });
  });
});
