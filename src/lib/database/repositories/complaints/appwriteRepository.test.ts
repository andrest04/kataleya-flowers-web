import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';

import type { ComplaintInsert, ComplaintsRepository } from './types';

const mocks = vi.hoisted(() => ({
  incrementDocumentAttribute: vi.fn(),
  createDocument: vi.fn(),
}));

class MockAppwriteException extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

vi.mock('node-appwrite', () => ({
  AppwriteException: MockAppwriteException,
}));

vi.mock('@/lib/appwrite/admin', () => ({
  createAdminClient: () => ({
    databases: {
      incrementDocumentAttribute: mocks.incrementDocumentAttribute,
      createDocument: mocks.createDocument,
    },
  }),
}));

vi.mock('@/lib/appwrite/config', () => ({
  getAppwriteConfig: () => ({ databaseId: 'test-db' }),
}));

const { createComplaintsRepository } = await import('./appwriteRepository');

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
  let repository: ComplaintsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createComplaintsRepository(createFakeDocumentStore());
  });

  it('returns the incremented value on the happy path', async () => {
    mocks.incrementDocumentAttribute.mockResolvedValueOnce({ value: 3 });

    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(3);
    expect(mocks.incrementDocumentAttribute).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'counters',
      documentId: 'complaints-2026',
      attribute: 'value',
      value: 1,
    });
    expect(mocks.createDocument).not.toHaveBeenCalled();
  });

  it('creates the counter document when it does not exist yet (404)', async () => {
    mocks.incrementDocumentAttribute.mockRejectedValueOnce(new MockAppwriteException('missing', 404));
    mocks.createDocument.mockResolvedValueOnce({ value: 1 });

    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(1);
    expect(mocks.createDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'counters',
      documentId: 'complaints-2026',
      data: { value: 1 },
    });
  });

  it('retries the increment when creation races into a conflict (409)', async () => {
    mocks.incrementDocumentAttribute
      .mockRejectedValueOnce(new MockAppwriteException('missing', 404))
      .mockResolvedValueOnce({ value: 4 });
    mocks.createDocument.mockRejectedValueOnce(new MockAppwriteException('exists', 409));

    await expect(repository.allocateCorrelativo(2026)).resolves.toBe(4);
    expect(mocks.incrementDocumentAttribute).toHaveBeenCalledTimes(2);
  });

  it('rethrows an unexpected error from the initial increment', async () => {
    mocks.incrementDocumentAttribute.mockRejectedValueOnce(new Error('boom'));

    await expect(repository.allocateCorrelativo(2026)).rejects.toThrow('boom');
    expect(mocks.createDocument).not.toHaveBeenCalled();
  });

  it('rethrows an unexpected error from the fallback create', async () => {
    mocks.incrementDocumentAttribute.mockRejectedValueOnce(new MockAppwriteException('missing', 404));
    mocks.createDocument.mockRejectedValueOnce(new Error('boom'));

    await expect(repository.allocateCorrelativo(2026)).rejects.toThrow('boom');
  });

  it('rethrows a non-409 error from the fallback create', async () => {
    mocks.incrementDocumentAttribute.mockRejectedValueOnce(new MockAppwriteException('missing', 404));
    mocks.createDocument.mockRejectedValueOnce(new MockAppwriteException('forbidden', 403));

    await expect(repository.allocateCorrelativo(2026)).rejects.toMatchObject({ code: 403 });
  });
});
