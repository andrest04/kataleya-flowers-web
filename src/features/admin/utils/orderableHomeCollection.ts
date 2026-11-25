import { randomUUID } from 'node:crypto';

import { uuid } from '@/features/admin/schemas/common';
import type { AdminActionFailure } from '@/features/admin/utils/auth';
import type {
  OrderableCollectionConfig,
  OrderableCollectionRepository,
  OrderableRecord,
} from '@/lib/database/orderableCollection/types';
import type { DocumentStore } from '@/lib/database/types';

export type FallbackPayloadResult<TWrite> =
  | { ok: true; payload: TWrite }
  | { ok: false; failure: AdminActionFailure };

interface OrderableWritePayload {
  displayOrder: number;
  isActive: boolean;
}

interface OrderableHomeCollectionOptions<
  TRow extends OrderableRecord,
  TWrite extends OrderableWritePayload,
  TFallback extends { id: string },
> {
  store: DocumentStore;
  config: OrderableCollectionConfig<TRow, TWrite>;
  repository: OrderableCollectionRepository<TRow, TWrite>;
  activeLimit: number;
  limitCopy: string;
  notFoundCopy: string;
  loadFallbacks(): Promise<readonly TFallback[]>;
  payloadFromFallback(
    item: TFallback,
    displayOrder: number,
  ): FallbackPayloadResult<TWrite> | Promise<FallbackPayloadResult<TWrite>>;
}

interface CreateEntryInput<TWrite> {
  fromFallbackId: string | undefined;
  isActive: boolean;
  toPayload(displayOrder: number): TWrite | Promise<TWrite>;
}

export interface OrderableHomeCollection<TRow extends OrderableRecord, TWrite> {
  limitFailure(): AdminActionFailure;
  activationFailure(existing: TRow, nextActive: boolean): Promise<AdminActionFailure | null>;
  create(input: CreateEntryInput<TWrite>): Promise<AdminActionFailure | null>;
  toggle(id: string, isActive: boolean): Promise<AdminActionFailure | null>;
}

export function readFromFallbackId(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('fromFallbackId' in data)) return undefined;
  const value = data.fromFallbackId;
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function activeCount(rows: OrderableRecord[]): number {
  return rows.filter((row) => row.isActive).length;
}

export function createOrderableHomeCollection<
  TRow extends OrderableRecord,
  TWrite extends OrderableWritePayload,
  TFallback extends { id: string },
>(
  options: OrderableHomeCollectionOptions<TRow, TWrite, TFallback>,
): OrderableHomeCollection<TRow, TWrite> {
  const { store, config, repository } = options;

  function limitFailure(): AdminActionFailure {
    return { success: false, error: options.limitCopy, code: 'VALIDATION' };
  }

  function notFoundFailure(): AdminActionFailure {
    return { success: false, error: options.notFoundCopy, code: 'INTERNAL' };
  }

  async function seedFallbacks(
    fallbacks: readonly TFallback[],
    replacement?: { id: string; payload: TWrite },
  ): Promise<AdminActionFailure | null> {
    const payloads: TWrite[] = [];
    for (const [index, item] of fallbacks.entries()) {
      const displayOrder = index + 1;
      if (replacement && item.id === replacement.id) {
        payloads.push({ ...replacement.payload, displayOrder });
        continue;
      }
      const mapped = await options.payloadFromFallback(item, displayOrder);
      if (!mapped.ok) return mapped.failure;
      payloads.push(mapped.payload);
    }
    await store.runInTransaction(async (tx) => {
      await Promise.all(
        payloads.map((payload) =>
          tx.create(config.collectionId, randomUUID(), config.toDocumentData(payload)),
        ),
      );
    });
    return null;
  }

  async function appendEntry(input: CreateEntryInput<TWrite>): Promise<void> {
    const displayOrder = await repository.getNextOrder();
    await repository.create(await input.toPayload(displayOrder));
  }

  async function create(input: CreateEntryInput<TWrite>): Promise<AdminActionFailure | null> {
    const existing = await repository.list();
    if (existing.length > 0) {
      if (input.isActive && activeCount(existing) >= options.activeLimit) return limitFailure();
      await appendEntry(input);
      return null;
    }
    const fallbacks = await options.loadFallbacks();
    const fallbackId = input.fromFallbackId;
    if (fallbackId !== undefined && fallbacks.some((item) => item.id === fallbackId)) {
      return seedFallbacks(fallbacks, { id: fallbackId, payload: await input.toPayload(1) });
    }
    const seedFailure = await seedFallbacks(fallbacks);
    if (seedFailure) return seedFailure;
    if (input.isActive) return limitFailure();
    await appendEntry(input);
    return null;
  }

  async function activationFailure(existing: TRow, nextActive: boolean): Promise<AdminActionFailure | null> {
    if (!nextActive || existing.isActive) return null;
    const others = (await repository.list()).filter((row) => row.id !== existing.id);
    return activeCount(others) >= options.activeLimit ? limitFailure() : null;
  }

  async function toggleFallback(id: string, isActive: boolean): Promise<AdminActionFailure | null> {
    const fallbacks = await options.loadFallbacks();
    const fallback = fallbacks.find((item) => item.id === id);
    if (!fallback) return notFoundFailure();
    const mapped = await options.payloadFromFallback(fallback, 1);
    if (!mapped.ok) return mapped.failure;
    return seedFallbacks(fallbacks, { id, payload: { ...mapped.payload, isActive } });
  }

  async function toggle(id: string, isActive: boolean): Promise<AdminActionFailure | null> {
    const rows = await repository.list();
    if (rows.length === 0) return toggleFallback(id, isActive);
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = rows.find((row) => row.id === idParsed.data);
    if (!existing) return notFoundFailure();
    if (isActive && !existing.isActive && activeCount(rows) >= options.activeLimit) return limitFailure();
    await repository.setActive(idParsed.data, isActive);
    return null;
  }

  return { limitFailure, activationFailure, create, toggle };
}
