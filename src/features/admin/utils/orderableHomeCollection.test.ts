import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';
import type { OrderableCollectionConfig, OrderableRecord } from '@/lib/database/orderableCollection/types';
import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';
import type { DocumentRecord, DocumentStore, TransactionHandle } from '@/lib/database/types';

import {
  createOrderableHomeCollection,
  type FallbackPayloadResult,
  readFromFallbackId,
} from './orderableHomeCollection';

interface Widget extends OrderableRecord {
  title: string;
  imageUrl: string;
}

interface WidgetWritePayload {
  title: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

interface WidgetFallback {
  id: string;
  title: string;
  imageSrc: string;
}

const LIMIT_COPY = 'Solo puedes tener 3 widgets activos.';
const NOT_FOUND_COPY = 'No encontramos ese widget.';
const LIMIT_FAILURE = { success: false, error: LIMIT_COPY, code: 'VALIDATION' };
const VALID_UUID = '0b6f5b8e-3c1f-4a52-9d0e-2f4a6c8b1d3e';

const widgetConfig: OrderableCollectionConfig<Widget, WidgetWritePayload> = {
  collectionId: 'widgets',
  assetUrlField: 'imageUrl',
  toRow: (doc: DocumentRecord & Record<string, unknown>): Widget => ({
    id: doc.id,
    title: doc.title as string,
    imageUrl: doc.image_url as string,
    displayOrder: doc.display_order as number,
    isActive: doc.is_active as boolean,
  }),
  toDocumentData: (payload: WidgetWritePayload): Record<string, unknown> => ({
    title: payload.title,
    image_url: payload.imageUrl,
    display_order: payload.displayOrder,
    is_active: payload.isActive,
  }),
};

const FALLBACKS: readonly WidgetFallback[] = [
  { id: 'f-1', title: 'Uno', imageSrc: '/uno.jpg' },
  { id: 'f-2', title: 'Dos', imageSrc: '/dos.jpg' },
  { id: 'f-3', title: 'Tres', imageSrc: '/tres.jpg' },
];

function widgetFromFallback(item: WidgetFallback, displayOrder: number): FallbackPayloadResult<WidgetWritePayload> {
  return {
    ok: true,
    payload: { title: item.title, imageUrl: item.imageSrc, displayOrder, isActive: true },
  };
}

function withStagedTransactions(base: FakeDocumentStore, failingCreate?: number): DocumentStore {
  const runInTransaction: DocumentStore['runInTransaction'] = async (work) => {
    const staged: { collectionId: string; id: string; data: Record<string, unknown> }[] = [];
    const rejectOther = async (): Promise<never> => {
      throw new Error('unsupported transaction operation');
    };
    const handle: TransactionHandle = {
      create: async <T extends DocumentRecord>(collectionId: string, id: string, data: Record<string, unknown>) => {
        if (staged.length + 1 === failingCreate) throw new Error('create failed');
        staged.push({ collectionId, id, data });
        return { ...data, id, createdAt: '', updatedAt: '' } as unknown as T;
      },
      update: rejectOther,
      delete: rejectOther,
      bulkUpdate: rejectOther,
      bulkDelete: rejectOther,
    };
    const result = await work(handle);
    for (const op of staged) await base.create(op.collectionId, op.id, op.data);
    return result;
  };
  return Object.assign(Object.create(base) as DocumentStore, { runInTransaction });
}

function buildCollection(
  store: DocumentStore,
  payloadFromFallback: (item: WidgetFallback, displayOrder: number) => FallbackPayloadResult<WidgetWritePayload> =
    widgetFromFallback,
) {
  return createOrderableHomeCollection({
    store,
    config: widgetConfig,
    repository: createOrderableCollectionRepository(store, widgetConfig),
    activeLimit: 3,
    limitCopy: LIMIT_COPY,
    notFoundCopy: NOT_FOUND_COPY,
    loadFallbacks: async () => FALLBACKS,
    payloadFromFallback,
  });
}

function newWidget(isActive: boolean) {
  return (displayOrder: number): WidgetWritePayload => ({
    title: 'Nuevo',
    imageUrl: '/nuevo.jpg',
    displayOrder,
    isActive,
  });
}

describe('readFromFallbackId', () => {
  it('returns a non-blank fromFallbackId string', () => {
    expect(readFromFallbackId({ fromFallbackId: 'f-2' })).toBe('f-2');
  });

  it('ignores missing, blank or non-string values', () => {
    expect(readFromFallbackId(null)).toBeUndefined();
    expect(readFromFallbackId({})).toBeUndefined();
    expect(readFromFallbackId({ fromFallbackId: '   ' })).toBeUndefined();
    expect(readFromFallbackId({ fromFallbackId: 7 })).toBeUndefined();
  });
});

describe('createOrderableHomeCollection', () => {
  let base: FakeDocumentStore;

  beforeEach(() => {
    base = createFakeDocumentStore();
  });

  async function storedWidgets(): Promise<Widget[]> {
    return createOrderableCollectionRepository(base, widgetConfig).list();
  }

  describe('fallback seeding', () => {
    it('seeds every fallback in one transaction when editing a fallback, replacing its slot', async () => {
      const store = withStagedTransactions(base);
      const transactionSpy = vi.spyOn(store, 'runInTransaction');
      const collection = buildCollection(store);

      const failure = await collection.create({ fromFallbackId: 'f-2', isActive: true, toPayload: newWidget(true) });

      expect(failure).toBeNull();
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      const rows = await storedWidgets();
      expect(rows.map((row) => [row.title, row.displayOrder])).toEqual([
        ['Uno', 1],
        ['Nuevo', 2],
        ['Tres', 3],
      ]);
    });

    it('seeds only once: a later create on the populated collection never reseeds', async () => {
      const store = withStagedTransactions(base);
      const transactionSpy = vi.spyOn(store, 'runInTransaction');
      const collection = buildCollection(store);

      await collection.create({ fromFallbackId: 'f-1', isActive: false, toPayload: newWidget(false) });
      const failure = await collection.create({ fromFallbackId: 'f-1', isActive: false, toPayload: newWidget(false) });

      expect(failure).toBeNull();
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(await storedWidgets()).toHaveLength(4);
    });

    it('stages the fallback creates one after another, never overlapping', async () => {
      const events: string[] = [];
      let inFlight = 0;
      let maxInFlight = 0;
      const rejectOther = async (): Promise<never> => {
        throw new Error('unsupported transaction operation');
      };
      const runInTransaction: DocumentStore['runInTransaction'] = async (work) =>
        work({
          create: async <T extends DocumentRecord>(_collectionId: string, id: string, data: Record<string, unknown>) => {
            const order = String(data.display_order);
            inFlight += 1;
            maxInFlight = Math.max(maxInFlight, inFlight);
            events.push(`start ${order}`);
            await new Promise((resolve) => setTimeout(resolve, 0));
            events.push(`end ${order}`);
            inFlight -= 1;
            return { ...data, id, createdAt: '', updatedAt: '' } as unknown as T;
          },
          update: rejectOther,
          delete: rejectOther,
          bulkUpdate: rejectOther,
          bulkDelete: rejectOther,
        });
      const store = Object.assign(Object.create(base) as DocumentStore, { runInTransaction });
      const collection = buildCollection(store);

      await expect(collection.toggle('f-2', false)).resolves.toBeNull();

      expect(maxInFlight).toBe(1);
      expect(events).toEqual(['start 1', 'end 1', 'start 2', 'end 2', 'start 3', 'end 3']);
    });

    it('leaves nothing seeded when the second create of the transaction fails', async () => {
      const store = withStagedTransactions(base, 2);
      const collection = buildCollection(store);

      await expect(
        collection.create({ fromFallbackId: 'f-3', isActive: true, toPayload: newWidget(true) }),
      ).rejects.toThrow('create failed');

      expect(await storedWidgets()).toEqual([]);
    });

    it('returns the mapper failure and writes nothing when a fallback cannot be mapped', async () => {
      const store = withStagedTransactions(base);
      const transactionSpy = vi.spyOn(store, 'runInTransaction');
      const imageFailure = { success: false as const, error: 'Imagen inválida', code: 'VALIDATION' as const };
      const collection = buildCollection(store, (item, displayOrder) =>
        item.id === 'f-2' ? { ok: false, failure: imageFailure } : widgetFromFallback(item, displayOrder),
      );

      const failure = await collection.create({ fromFallbackId: 'f-1', isActive: true, toPayload: newWidget(true) });

      expect(failure).toEqual(imageFailure);
      expect(transactionSpy).not.toHaveBeenCalled();
      expect(await storedWidgets()).toEqual([]);
    });

    it('seeds the fallbacks and then enforces the limit for an unrelated active entry', async () => {
      const collection = buildCollection(withStagedTransactions(base));

      const failure = await collection.create({ fromFallbackId: undefined, isActive: true, toPayload: newWidget(true) });

      expect(failure).toEqual(LIMIT_FAILURE);
      expect(await storedWidgets()).toHaveLength(3);
    });

    it('seeds the fallbacks and appends an unrelated inactive entry', async () => {
      const collection = buildCollection(withStagedTransactions(base));

      const failure = await collection.create({ fromFallbackId: 'unknown', isActive: false, toPayload: newWidget(false) });

      expect(failure).toBeNull();
      const rows = await storedWidgets();
      expect(rows.map((row) => [row.title, row.displayOrder, row.isActive])).toEqual([
        ['Uno', 1, true],
        ['Dos', 2, true],
        ['Tres', 3, true],
        ['Nuevo', 4, false],
      ]);
    });
  });

  describe('active limit', () => {
    async function seedActive(count: number): Promise<void> {
      const repository = createOrderableCollectionRepository(base, widgetConfig);
      for (let index = 0; index < count; index += 1) {
        await repository.create({ title: `W${index}`, imageUrl: '/w.jpg', displayOrder: index + 1, isActive: true });
      }
    }

    it('returns the limit failure when creating an active entry at the limit', async () => {
      await seedActive(3);
      const collection = buildCollection(base);

      await expect(
        collection.create({ fromFallbackId: undefined, isActive: true, toPayload: newWidget(true) }),
      ).resolves.toEqual(LIMIT_FAILURE);
      await expect(
        collection.create({ fromFallbackId: undefined, isActive: false, toPayload: newWidget(false) }),
      ).resolves.toBeNull();
      expect(await storedWidgets()).toHaveLength(4);
    });

    it('exposes the limit failure', () => {
      expect(buildCollection(base).limitFailure()).toEqual(LIMIT_FAILURE);
    });

    it('blocks activating an inactive entry only when the others already fill the limit', async () => {
      await seedActive(3);
      const repository = createOrderableCollectionRepository(base, widgetConfig);
      const inactiveId = await repository.create({ title: 'Off', imageUrl: '/o.jpg', displayOrder: 4, isActive: false });
      const inactive = await repository.findById(inactiveId);
      const [active] = await repository.list();
      if (!inactive || !active) throw new Error('widgets were not seeded');
      const collection = buildCollection(base);

      await expect(collection.activationFailure(inactive, true)).resolves.toEqual(LIMIT_FAILURE);
      await expect(collection.activationFailure(inactive, false)).resolves.toBeNull();
      await expect(collection.activationFailure(active, true)).resolves.toBeNull();
    });
  });

  describe('toggle', () => {
    it('seeds the fallbacks with the toggled state when the collection is empty', async () => {
      const collection = buildCollection(withStagedTransactions(base));

      await expect(collection.toggle('f-3', false)).resolves.toBeNull();

      const rows = await storedWidgets();
      expect(rows.map((row) => [row.title, row.isActive])).toEqual([
        ['Uno', true],
        ['Dos', true],
        ['Tres', false],
      ]);
    });

    it('returns not found for an unknown fallback id on an empty collection', async () => {
      const collection = buildCollection(withStagedTransactions(base));

      await expect(collection.toggle('missing', true)).resolves.toEqual({
        success: false,
        error: NOT_FOUND_COPY,
        code: 'INTERNAL',
      });
      expect(await storedWidgets()).toEqual([]);
    });

    it('rejects an invalid id on a populated collection', async () => {
      const repository = createOrderableCollectionRepository(base, widgetConfig);
      await repository.create({ title: 'A', imageUrl: '/a.jpg', displayOrder: 1, isActive: true });
      const collection = buildCollection(base);

      await expect(collection.toggle('not-a-uuid', true)).resolves.toMatchObject({
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
      });
      await expect(collection.toggle(VALID_UUID, true)).resolves.toEqual({
        success: false,
        error: NOT_FOUND_COPY,
        code: 'INTERNAL',
      });
    });

    it('enforces the limit and flips the state on a populated collection', async () => {
      const repository = createOrderableCollectionRepository(base, widgetConfig);
      for (let index = 0; index < 3; index += 1) {
        await repository.create({ title: `W${index}`, imageUrl: '/w.jpg', displayOrder: index + 1, isActive: true });
      }
      const inactiveId = await repository.create({ title: 'Off', imageUrl: '/o.jpg', displayOrder: 4, isActive: false });
      const [active] = await repository.list();
      if (!active) throw new Error('widgets were not seeded');
      const activeId = active.id;
      const collection = buildCollection(base);

      await expect(collection.toggle(inactiveId, true)).resolves.toEqual(LIMIT_FAILURE);
      await expect(collection.toggle(activeId, false)).resolves.toBeNull();
      await expect(collection.toggle(inactiveId, true)).resolves.toBeNull();
      expect((await repository.findById(inactiveId))?.isActive).toBe(true);
      expect((await repository.findById(activeId))?.isActive).toBe(false);
    });
  });
});
