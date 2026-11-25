import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';

import { createComplaintsRepository } from './appwriteRepository';
import type { ComplaintInsert, ComplaintsRepository } from './types';

const COLLECTION_ID = 'complaints';

interface ComplaintSeedOverrides {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  correlativo?: number;
  complaint_type?: string;
  status?: string;
  responded_at?: string | null;
  provider_response?: string | null;
  consumer_phone?: string | null;
  claimed_amount?: number | null;
}

function seedComplaint(store: FakeDocumentStore, overrides: ComplaintSeedOverrides = {}): string {
  const id = overrides.id ?? 'c1';
  store.seed(COLLECTION_ID, {
    id,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    correlativo: overrides.correlativo ?? 1,
    complaint_type: overrides.complaint_type ?? 'RECLAMO',
    consumer_name: 'Ana Torres',
    consumer_doc_type: 'DNI',
    consumer_doc_number: '12345678',
    consumer_email: 'ana@example.com',
    consumer_phone: overrides.consumer_phone ?? null,
    consumer_address: 'Av. Siempre Viva 742',
    is_minor: false,
    guardian_name: null,
    item_type: 'PRODUCTO',
    item_description: 'Ramo de rosas',
    claimed_amount: overrides.claimed_amount ?? null,
    detail: 'El producto llegó marchito.',
    consumer_request: 'Reembolso',
    provider_response: overrides.provider_response ?? null,
    status: overrides.status ?? 'PENDIENTE',
    responded_at: overrides.responded_at ?? null,
    email_sent: false,
  });
  return id;
}

function baseInsert(overrides: Partial<ComplaintInsert> = {}): ComplaintInsert {
  return {
    correlativo: 5,
    complaintType: 'RECLAMO',
    consumerName: 'Ana Torres',
    consumerDocType: 'DNI',
    consumerDocNumber: '12345678',
    consumerEmail: 'ana@example.com',
    consumerPhone: null,
    consumerAddress: 'Av. Siempre Viva 742',
    isMinor: false,
    guardianName: null,
    itemType: 'PRODUCTO',
    itemDescription: 'Ramo de rosas',
    claimedAmount: null,
    detail: 'El producto llegó marchito.',
    consumerRequest: 'Reembolso',
    ...overrides,
  };
}

describe('complaintsRepository (fake store)', () => {
  let store: FakeDocumentStore;
  let repository: ComplaintsRepository;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createComplaintsRepository(store);
  });

  describe('list', () => {
    it('returns every complaint mapped to camelCase, newest first', async () => {
      seedComplaint(store, { id: 'c1', createdAt: '2026-01-01T00:00:00.000Z', correlativo: 1 });
      seedComplaint(store, {
        id: 'c2',
        createdAt: '2026-02-01T00:00:00.000Z',
        correlativo: 2,
        complaint_type: 'QUEJA',
        consumer_phone: '999999999',
        claimed_amount: 50,
      });

      const result = await repository.list();

      expect(result.map((c) => c.id)).toEqual(['c2', 'c1']);
      expect(result[0]).toMatchObject({
        correlativo: 2,
        complaintType: 'QUEJA',
        consumerPhone: '999999999',
        claimedAmount: 50,
      });
      expect(result[0]).not.toHaveProperty('complaint_type');
    });

    it('returns an empty array when there are no complaints', async () => {
      await expect(repository.list()).resolves.toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns the mapped complaint when found', async () => {
      seedComplaint(store, { id: 'c1' });

      const result = await repository.findById('c1');

      expect(result).toMatchObject({
        id: 'c1',
        complaintType: 'RECLAMO',
        consumerName: 'Ana Torres',
        status: 'PENDIENTE',
      });
    });

    it('returns null when the complaint does not exist', async () => {
      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('insert', () => {
    it('creates a complaint with default status fields and returns the created summary', async () => {
      const created = await repository.insert(baseInsert());

      expect(created.correlativo).toBe(5);
      expect(created.id).toEqual(expect.any(String));
      expect(created.createdAt).toEqual(expect.any(String));

      const stored = await repository.findById(created.id);
      expect(stored).toMatchObject({
        correlativo: 5,
        status: 'PENDIENTE',
        providerResponse: null,
        respondedAt: null,
        emailSent: false,
      });
    });

    it('stores the complaint with private document permissions', async () => {
      const created = await repository.insert(baseInsert());

      expect(store.permissionsOf(COLLECTION_ID, created.id)).toEqual([]);
    });

    it('preserves a null guardianName for adult consumers', async () => {
      const created = await repository.insert(baseInsert({ isMinor: false, guardianName: null }));

      const stored = await repository.findById(created.id);
      expect(stored).toMatchObject({ isMinor: false, guardianName: null });
    });

    it('stores guardianName for minor consumers', async () => {
      const created = await repository.insert(
        baseInsert({ isMinor: true, guardianName: 'Carlos Torres' }),
      );

      const stored = await repository.findById(created.id);
      expect(stored).toMatchObject({ isMinor: true, guardianName: 'Carlos Torres' });
    });
  });

  describe('updateStatus', () => {
    it('updates status, providerResponse and respondedAt', async () => {
      seedComplaint(store, { id: 'c1' });

      await repository.updateStatus('c1', {
        status: 'RESPONDIDO',
        providerResponse: 'Reembolso procesado.',
        respondedAt: '2026-03-01T00:00:00.000Z',
      });

      const updated = await repository.findById('c1');
      expect(updated).toMatchObject({
        status: 'RESPONDIDO',
        providerResponse: 'Reembolso procesado.',
        respondedAt: '2026-03-01T00:00:00.000Z',
      });
    });
  });
});

describe('complaintsRepository.allocateCorrelativo', () => {
  let store: FakeDocumentStore;
  let repository: ComplaintsRepository;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createComplaintsRepository(store);
  });

  it('allocates sequential correlativos starting at 1', async () => {
    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(1);
    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(2);
    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(3);
  });

  it('keeps an independent sequence per year', async () => {
    await repository.allocateCorrelativo(2026);
    await repository.allocateCorrelativo(2026);

    await expect(repository.allocateCorrelativo(2027)).resolves.toBe(1);
  });

  it('continues from an existing counter document', async () => {
    store.seed('counters', {
      id: 'complaints-2026',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      value: 41,
    });

    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(42);
  });

  it('creates the counter document with private permissions', async () => {
    await repository.allocateCorrelativo(2026);

    expect(store.permissionsOf('counters', 'complaints-2026')).toEqual([]);
  });

  it('increments the counters collection through the document store port', async () => {
    const increment = vi.spyOn(store, 'increment');

    await repository.allocateCorrelativo(2026);

    expect(increment).toHaveBeenCalledWith('counters', 'complaints-2026', 'value', 1, {});
  });

  it('propagates store failures', async () => {
    vi.spyOn(store, 'increment').mockRejectedValueOnce(new Error('boom'));

    await expect(repository.allocateCorrelativo(2026)).rejects.toThrow('boom');
  });
});
