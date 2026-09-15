import { beforeEach, describe, expect, it } from 'vitest';

import { createFakeDocumentStore, type FakeDocumentStore } from '../testUtils/fakeDocumentStore';
import type { DocumentRecord } from '../types';
import { createOrderableCollectionRepository } from './factory';
import type { OrderableCollectionConfig, OrderableCollectionRepository, OrderableRecord } from './types';

interface Widget extends OrderableRecord {
  title: string;
  imageUrl: string;
}

interface WidgetWritePayload {
  title: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl: string;
}

function toRow(doc: DocumentRecord & Record<string, unknown>): Widget {
  return {
    id: doc.id,
    title: doc.title as string,
    imageUrl: doc.image_url as string,
    displayOrder: doc.display_order as number,
    isActive: doc.is_active as boolean,
  };
}

function toDocumentData(payload: WidgetWritePayload): Record<string, unknown> {
  return {
    title: payload.title,
    image_url: payload.imageUrl,
    display_order: payload.displayOrder,
    is_active: payload.isActive,
  };
}

const configWithAsset: OrderableCollectionConfig<Widget, WidgetWritePayload> = {
  collectionId: 'widgets',
  assetUrlField: 'imageUrl',
  toRow,
  toDocumentData,
};

const configWithoutAsset: OrderableCollectionConfig<Widget, WidgetWritePayload> = {
  collectionId: 'widgets',
  toRow,
  toDocumentData,
};

function seedWidget(
  store: FakeDocumentStore,
  id: string,
  overrides: Partial<WidgetWritePayload> = {},
): void {
  store.seed('widgets', {
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    title: overrides.title ?? id,
    image_url: overrides.imageUrl ?? `https://example.com/${id}.jpg`,
    display_order: overrides.displayOrder ?? 1,
    is_active: overrides.isActive ?? true,
  });
}

describe('createOrderableCollectionRepository', () => {
  let store: FakeDocumentStore;
  let repository: OrderableCollectionRepository<Widget, WidgetWritePayload>;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createOrderableCollectionRepository(store, configWithAsset);
  });

  describe('create/list/findById', () => {
    it('creates a document and returns its generated id', async () => {
      const id = await repository.create({
        title: 'Rose',
        imageUrl: 'https://example.com/rose.jpg',
        displayOrder: 1,
        isActive: true,
      });

      expect(typeof id).toBe('string');
      const found = await repository.findById(id);
      expect(found).toMatchObject({ id, title: 'Rose', displayOrder: 1, isActive: true });
    });

    it('lists rows ordered by displayOrder ascending', async () => {
      seedWidget(store, 'w1', { displayOrder: 2 });
      seedWidget(store, 'w2', { displayOrder: 1 });
      seedWidget(store, 'w3', { displayOrder: 3 });

      const rows = await repository.list();

      expect(rows.map((row) => row.id)).toEqual(['w2', 'w1', 'w3']);
    });

    it('returns null from findById when the document does not exist', async () => {
      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('getNextOrder', () => {
    it('returns 1 when the collection is empty', async () => {
      await expect(repository.getNextOrder()).resolves.toBe(1);
    });

    it('returns one past the highest existing displayOrder', async () => {
      seedWidget(store, 'w1', { displayOrder: 4 });
      seedWidget(store, 'w2', { displayOrder: 7 });

      await expect(repository.getNextOrder()).resolves.toBe(8);
    });
  });

  describe('update/setActive', () => {
    it('persists updated fields', async () => {
      seedWidget(store, 'w1', { title: 'Old' });

      await repository.update('w1', {
        title: 'New',
        imageUrl: 'https://example.com/new.jpg',
        displayOrder: 1,
        isActive: true,
      });

      const found = await repository.findById('w1');
      expect(found?.title).toBe('New');
    });

    it('flips isActive without touching other fields', async () => {
      seedWidget(store, 'w1', { title: 'Keep', isActive: true });

      await repository.setActive('w1', false);

      const found = await repository.findById('w1');
      expect(found).toMatchObject({ title: 'Keep', isActive: false });
    });
  });

  describe('delete', () => {
    it('returns null when the document does not exist', async () => {
      await expect(repository.delete('missing')).resolves.toBeNull();
    });

    it('returns the configured asset url field after deleting', async () => {
      seedWidget(store, 'w1', { imageUrl: 'https://example.com/w1.jpg' });

      const result = await repository.delete('w1');

      expect(result).toBe('https://example.com/w1.jpg');
      await expect(repository.findById('w1')).resolves.toBeNull();
    });

    it('returns null after deleting when no assetUrlField is configured', async () => {
      const noAssetRepository = createOrderableCollectionRepository(store, configWithoutAsset);
      seedWidget(store, 'w1', {});

      const result = await noAssetRepository.delete('w1');

      expect(result).toBeNull();
      await expect(noAssetRepository.findById('w1')).resolves.toBeNull();
    });
  });

  describe('reorder', () => {
    it('reassigns the existing displayOrder values across the given id order', async () => {
      seedWidget(store, 'w1', { displayOrder: 1 });
      seedWidget(store, 'w2', { displayOrder: 2 });
      seedWidget(store, 'w3', { displayOrder: 3 });

      await repository.reorder(['w3', 'w1', 'w2']);

      const rows = await repository.list();
      const byId = new Map(rows.map((row) => [row.id, row.displayOrder]));
      expect(byId.get('w3')).toBe(1);
      expect(byId.get('w1')).toBe(2);
      expect(byId.get('w2')).toBe(3);
    });

    it('aborts silently when one of the given ids does not exist', async () => {
      seedWidget(store, 'w1', { displayOrder: 1 });
      seedWidget(store, 'w2', { displayOrder: 2 });

      await repository.reorder(['w1', 'missing']);

      const rows = await repository.list();
      const byId = new Map(rows.map((row) => [row.id, row.displayOrder]));
      expect(byId.get('w1')).toBe(1);
      expect(byId.get('w2')).toBe(2);
    });
  });
});
