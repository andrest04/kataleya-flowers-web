import { beforeEach, describe, expect, it } from 'vitest';

import type { DocumentRecord } from '../types';
import { createFakeDocumentStore, type FakeDocumentStore } from './fakeDocumentStore';

interface WidgetRecord extends DocumentRecord {
  name: string;
  displayOrder: number;
  categoryId: string;
}

describe('fakeDocumentStore', () => {
  let store: FakeDocumentStore;

  beforeEach(() => {
    store = createFakeDocumentStore();
  });

  describe('create/getById', () => {
    it('creates a document and reads it back by id', async () => {
      const created = await store.create<WidgetRecord>('widgets', 'w1', {
        name: 'Rose',
        displayOrder: 1,
        categoryId: 'flowers',
      });

      expect(created).toMatchObject({ id: 'w1', name: 'Rose', displayOrder: 1 });
      expect(created.createdAt).toEqual(created.updatedAt);

      const fetched = await store.getById<WidgetRecord>('widgets', 'w1');
      expect(fetched).toEqual(created);
    });

    it('returns null for a missing document', async () => {
      await expect(store.getById('widgets', 'missing')).resolves.toBeNull();
    });

    it('keeps collections isolated from each other', async () => {
      await store.create('widgets', 'shared-id', { name: 'A' });
      await store.create('gadgets', 'shared-id', { name: 'B' });

      const widget = await store.getById<WidgetRecord & { name: string }>('widgets', 'shared-id');
      const gadget = await store.getById<WidgetRecord & { name: string }>('gadgets', 'shared-id');

      expect(widget?.name).toBe('A');
      expect(gadget?.name).toBe('B');
    });
  });

  describe('update/delete', () => {
    it('merges partial data into an existing document and bumps updatedAt', async () => {
      const created = await store.create<WidgetRecord>('widgets', 'w1', {
        name: 'Rose',
        displayOrder: 1,
        categoryId: 'flowers',
      });

      const updated = await store.update<WidgetRecord>('widgets', 'w1', { displayOrder: 2 });

      expect(updated).toMatchObject({ id: 'w1', name: 'Rose', displayOrder: 2 });
      expect(updated.createdAt).toBe(created.createdAt);
    });

    it('rejects updating a document that does not exist', async () => {
      await expect(store.update('widgets', 'missing', { name: 'x' })).rejects.toThrow();
    });

    it('deletes a document', async () => {
      await store.create('widgets', 'w1', { name: 'Rose' });
      await store.delete('widgets', 'w1');

      await expect(store.getById('widgets', 'w1')).resolves.toBeNull();
    });

    it('does not throw when deleting a missing document', async () => {
      await expect(store.delete('widgets', 'missing')).resolves.toBeUndefined();
    });
  });

  describe('listAll', () => {
    beforeEach(async () => {
      await store.create<WidgetRecord>('widgets', 'w1', { name: 'Rose', displayOrder: 2, categoryId: 'flowers' });
      await store.create<WidgetRecord>('widgets', 'w2', { name: 'Tulip', displayOrder: 1, categoryId: 'flowers' });
      await store.create<WidgetRecord>('widgets', 'w3', { name: 'Vase', displayOrder: 3, categoryId: 'accessories' });
    });

    it('returns every document when no query is given', async () => {
      const all = await store.listAll<WidgetRecord>('widgets');
      expect(all).toHaveLength(3);
    });

    it('filters by equal on a single value', async () => {
      const flowers = await store.listAll<WidgetRecord>('widgets', {
        equal: { categoryId: 'flowers' },
      });
      expect(flowers.map((doc) => doc.id).sort()).toEqual(['w1', 'w2']);
    });

    it('filters by equal on an IN-list of values', async () => {
      const results = await store.listAll<WidgetRecord>('widgets', {
        equal: { id: ['w1', 'w3'] },
      });
      expect(results.map((doc) => doc.id).sort()).toEqual(['w1', 'w3']);
    });

    it('orders ascending and descending by a numeric field', async () => {
      const asc = await store.listAll<WidgetRecord>('widgets', {
        orderBy: { field: 'displayOrder', direction: 'asc' },
      });
      expect(asc.map((doc) => doc.id)).toEqual(['w2', 'w1', 'w3']);

      const desc = await store.listAll<WidgetRecord>('widgets', {
        orderBy: { field: 'displayOrder', direction: 'desc' },
      });
      expect(desc.map((doc) => doc.id)).toEqual(['w3', 'w1', 'w2']);
    });

    it('caps results with limit', async () => {
      const limited = await store.listAll<WidgetRecord>('widgets', {
        orderBy: { field: 'displayOrder', direction: 'asc' },
        limit: 2,
      });
      expect(limited.map((doc) => doc.id)).toEqual(['w2', 'w1']);
    });

    it('resumes after cursorAfterId', async () => {
      const page = await store.listAll<WidgetRecord>('widgets', {
        orderBy: { field: 'displayOrder', direction: 'asc' },
        cursorAfterId: 'w2',
      });
      expect(page.map((doc) => doc.id)).toEqual(['w1', 'w3']);
    });

    it('projects only the selected fields plus record metadata', async () => {
      const projected = await store.listAll<Pick<WidgetRecord, 'id' | 'createdAt' | 'updatedAt' | 'name'>>(
        'widgets',
        { equal: { id: 'w1' }, select: ['name'] },
      );

      expect(projected).toEqual([
        expect.objectContaining({ id: 'w1', name: 'Rose' }),
      ]);
      expect(Object.keys(projected[0])).not.toContain('displayOrder');
    });
  });

  describe('findOne', () => {
    it('returns the first match or null', async () => {
      await store.create<WidgetRecord>('widgets', 'w1', { name: 'Rose', displayOrder: 1, categoryId: 'flowers' });

      const found = await store.findOne<WidgetRecord>('widgets', { equal: { categoryId: 'flowers' } });
      expect(found?.id).toBe('w1');

      const missing = await store.findOne<WidgetRecord>('widgets', { equal: { categoryId: 'nope' } });
      expect(missing).toBeNull();
    });
  });

  describe('runInTransaction', () => {
    it('applies bulkUpdate operations across collections', async () => {
      await store.create('widgets', 'w1', { displayOrder: 1 });
      await store.create('gadgets', 'g1', { displayOrder: 1 });

      await store.runInTransaction(async (tx) => {
        await tx.bulkUpdate([
          { collectionId: 'widgets', id: 'w1', data: { displayOrder: 5 } },
          { collectionId: 'gadgets', id: 'g1', data: { displayOrder: 9 } },
        ]);
      });

      const widget = await store.getById<WidgetRecord>('widgets', 'w1');
      const gadget = await store.getById<WidgetRecord>('gadgets', 'g1');
      expect(widget?.displayOrder).toBe(5);
      expect(gadget?.displayOrder).toBe(9);
    });

    it('returns the work function result', async () => {
      const result = await store.runInTransaction(async () => 'done');
      expect(result).toBe('done');
    });

    it('creates a document through the transaction handle', async () => {
      const created = await store.runInTransaction((tx) =>
        tx.create<WidgetRecord>('widgets', 'w1', { name: 'Rose', displayOrder: 1, categoryId: 'flowers' }),
      );

      expect(created).toMatchObject({ id: 'w1', name: 'Rose' });
      await expect(store.getById('widgets', 'w1')).resolves.toMatchObject({ name: 'Rose' });
    });

    it('updates a document through the transaction handle', async () => {
      await store.create<WidgetRecord>('widgets', 'w1', { name: 'Rose', displayOrder: 1, categoryId: 'flowers' });

      await store.runInTransaction((tx) => tx.update('widgets', 'w1', { displayOrder: 7 }));

      await expect(store.getById('widgets', 'w1')).resolves.toMatchObject({ displayOrder: 7 });
    });

    it('deletes a document through the transaction handle', async () => {
      await store.create('widgets', 'w1', { name: 'Rose' });

      await store.runInTransaction((tx) => tx.delete('widgets', 'w1'));

      await expect(store.getById('widgets', 'w1')).resolves.toBeNull();
    });

    it('applies bulkDelete operations across collections', async () => {
      await store.create('widgets', 'w1', { name: 'Rose' });
      await store.create('gadgets', 'g1', { name: 'Gizmo' });

      await store.runInTransaction((tx) =>
        tx.bulkDelete([
          { collectionId: 'widgets', id: 'w1' },
          { collectionId: 'gadgets', id: 'g1' },
        ]),
      );

      await expect(store.getById('widgets', 'w1')).resolves.toBeNull();
      await expect(store.getById('gadgets', 'g1')).resolves.toBeNull();
    });
  });

  describe('seed/reset test helpers', () => {
    it('seed inserts a document directly and reset clears every collection', async () => {
      store.seed<WidgetRecord>('widgets', {
        id: 'seeded',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'Seeded',
        displayOrder: 0,
        categoryId: 'flowers',
      });

      await expect(store.getById('widgets', 'seeded')).resolves.toMatchObject({ name: 'Seeded' });

      store.reset();

      await expect(store.getById('widgets', 'seeded')).resolves.toBeNull();
    });
  });
});
