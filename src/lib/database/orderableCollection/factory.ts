import { randomUUID } from 'node:crypto';

import type { DocumentRecord, DocumentStore } from '../types';
import type { OrderableCollectionConfig, OrderableCollectionRepository, OrderableRecord } from './types';

const DISPLAY_ORDER_FIELD = 'display_order';
const IS_ACTIVE_FIELD = 'is_active';

type RawDocument = DocumentRecord & Record<string, unknown>;

function readDisplayOrder(doc: RawDocument): number {
  const value = doc[DISPLAY_ORDER_FIELD];
  return typeof value === 'number' ? value : 0;
}

export function createOrderableCollectionRepository<TRow extends OrderableRecord, TWrite>(
  store: DocumentStore,
  config: OrderableCollectionConfig<TRow, TWrite>,
): OrderableCollectionRepository<TRow, TWrite> {
  async function list(): Promise<TRow[]> {
    const docs = await store.listAll<RawDocument>(config.collectionId, {
      orderBy: { field: DISPLAY_ORDER_FIELD, direction: 'asc' },
    });
    return docs.map((doc) => config.toRow(doc));
  }

  async function findById(id: string): Promise<TRow | null> {
    const doc = await store.getById<RawDocument>(config.collectionId, id);
    return doc ? config.toRow(doc) : null;
  }

  async function getNextOrder(): Promise<number> {
    const doc = await store.findOne<RawDocument>(config.collectionId, {
      orderBy: { field: DISPLAY_ORDER_FIELD, direction: 'desc' },
      limit: 1,
    });
    return doc ? readDisplayOrder(doc) + 1 : 1;
  }

  async function create(payload: TWrite): Promise<string> {
    const doc = await store.create<RawDocument>(
      config.collectionId,
      randomUUID(),
      config.toDocumentData(payload),
    );
    return doc.id;
  }

  async function update(id: string, payload: TWrite): Promise<void> {
    await store.update(config.collectionId, id, config.toDocumentData(payload));
  }

  async function setActive(id: string, isActive: boolean): Promise<void> {
    await store.update(config.collectionId, id, { [IS_ACTIVE_FIELD]: isActive });
  }

  async function deleteRow(id: string): Promise<string | null> {
    const existing = await findById(id);
    if (!existing) return null;
    await store.delete(config.collectionId, id);
    if (!config.assetUrlField) return null;
    const value = existing[config.assetUrlField];
    return typeof value === 'string' ? value : null;
  }

  async function reorder(orderedIds: string[]): Promise<void> {
    const found = await Promise.all(
      orderedIds.map((id) => store.getById<RawDocument>(config.collectionId, id)),
    );
    const presentDocs = found.filter((doc): doc is RawDocument => doc !== null);
    if (presentDocs.length !== orderedIds.length) return;

    const slots = presentDocs.map(readDisplayOrder).sort((a, b) => a - b);

    await store.runInTransaction(async (tx) => {
      await tx.bulkUpdate(
        orderedIds.map((id, index) => ({
          collectionId: config.collectionId,
          id,
          data: { [DISPLAY_ORDER_FIELD]: slots[index] },
        })),
      );
    });
  }

  return {
    list,
    findById,
    getNextOrder,
    create,
    update,
    setActive,
    delete: deleteRow,
    reorder,
  };
}
