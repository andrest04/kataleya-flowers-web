import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryEqual: vi.fn((field: string, value: unknown) => `equal(${field}=${JSON.stringify(value)})`),
  queryOrderAsc: vi.fn((field: string) => `orderAsc(${field})`),
  queryOrderDesc: vi.fn((field: string) => `orderDesc(${field})`),
  queryLimit: vi.fn((value: number) => `limit(${value})`),
  queryCursorAfter: vi.fn((id: string) => `cursorAfter(${id})`),
  querySelect: vi.fn((fields: string[]) => `select(${fields.join(',')})`),
  idCustom: vi.fn((id: string) => `custom:${id}`),
  listDocuments: vi.fn(),
  getDocument: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  createOperations: vi.fn(),
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
  ID: { custom: mocks.idCustom },
  Query: {
    equal: mocks.queryEqual,
    orderAsc: mocks.queryOrderAsc,
    orderDesc: mocks.queryOrderDesc,
    limit: mocks.queryLimit,
    cursorAfter: mocks.queryCursorAfter,
    select: mocks.querySelect,
  },
}));

vi.mock('@/lib/appwrite/admin', () => ({
  createAdminClient: () => ({
    databases: {
      listDocuments: mocks.listDocuments,
      getDocument: mocks.getDocument,
      createDocument: mocks.createDocument,
      updateDocument: mocks.updateDocument,
      deleteDocument: mocks.deleteDocument,
      createTransaction: mocks.createTransaction,
      updateTransaction: mocks.updateTransaction,
      createOperations: mocks.createOperations,
    },
  }),
}));

vi.mock('@/lib/appwrite/config', () => ({
  getAppwriteConfig: () => ({ databaseId: 'test-db' }),
}));

const { ConflictError } = await import('./errors');
const { appwriteDocumentStore } = await import('./appwriteProvider');

function appwriteDoc(overrides: Record<string, unknown>) {
  return {
    $id: 'doc-1',
    $createdAt: '2026-01-01T00:00:00.000Z',
    $updatedAt: '2026-01-02T00:00:00.000Z',
    $collectionId: 'widgets',
    $databaseId: 'test-db',
    $permissions: [],
    $sequence: '1',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('appwriteDocumentStore.listAll', () => {
  it('paginates through every page when no limit is given', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      appwriteDoc({ $id: `doc-${index}`, name: `Widget ${index}` }),
    );
    const secondPage = [appwriteDoc({ $id: 'doc-100', name: 'Widget 100' })];

    mocks.listDocuments
      .mockResolvedValueOnce({ documents: firstPage, total: 101 })
      .mockResolvedValueOnce({ documents: secondPage, total: 101 });

    const result = await appwriteDocumentStore.listAll('widgets', {
      equal: { isActive: true },
      orderBy: { field: 'displayOrder', direction: 'asc' },
    });

    expect(result).toHaveLength(101);
    expect(result[0]).toEqual({
      id: 'doc-0',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      name: 'Widget 0',
    });
    expect(result[0]).not.toHaveProperty('$id');
    expect(result[0]).not.toHaveProperty('$collectionId');

    expect(mocks.listDocuments).toHaveBeenCalledTimes(2);
    expect(mocks.listDocuments).toHaveBeenNthCalledWith(1, {
      databaseId: 'test-db',
      collectionId: 'widgets',
      queries: ['equal(isActive=true)', 'orderAsc(displayOrder)', 'limit(100)'],
    });
    expect(mocks.listDocuments).toHaveBeenNthCalledWith(2, {
      databaseId: 'test-db',
      collectionId: 'widgets',
      queries: ['equal(isActive=true)', 'orderAsc(displayOrder)', 'limit(100)', 'cursorAfter(doc-99)'],
    });
  });

  it('stops after the first page once fewer than the page size come back', async () => {
    mocks.listDocuments.mockResolvedValueOnce({ documents: [appwriteDoc({})], total: 1 });

    const result = await appwriteDocumentStore.listAll('widgets');

    expect(result).toHaveLength(1);
    expect(mocks.listDocuments).toHaveBeenCalledTimes(1);
  });

  it('performs a single bounded call when a limit is given', async () => {
    mocks.listDocuments.mockResolvedValueOnce({
      documents: [appwriteDoc({ $id: 'a' }), appwriteDoc({ $id: 'b' })],
      total: 2,
    });

    const result = await appwriteDocumentStore.listAll('widgets', {
      limit: 2,
      cursorAfterId: 'start',
      select: ['name'],
    });

    expect(result).toHaveLength(2);
    expect(mocks.listDocuments).toHaveBeenCalledTimes(1);
    expect(mocks.listDocuments).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      queries: ['select(name)', 'limit(2)', 'cursorAfter(start)'],
    });
  });

  it('translates an equal IN-list without wrapping it further', async () => {
    mocks.listDocuments.mockResolvedValueOnce({ documents: [], total: 0 });

    await appwriteDocumentStore.listAll('widgets', { equal: { id: ['a', 'b'] } });

    expect(mocks.queryEqual).toHaveBeenCalledWith('id', ['a', 'b']);
  });
});

describe('appwriteDocumentStore.findOne', () => {
  it('returns the mapped first document', async () => {
    mocks.listDocuments.mockResolvedValueOnce({ documents: [appwriteDoc({ name: 'Rose' })], total: 1 });

    const result = await appwriteDocumentStore.findOne('widgets', { equal: { slug: 'rose' } });

    expect(result).toMatchObject({ id: 'doc-1', name: 'Rose' });
    expect(mocks.listDocuments).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      queries: ['equal(slug="rose")', 'limit(1)'],
    });
  });

  it('returns null when nothing matches', async () => {
    mocks.listDocuments.mockResolvedValueOnce({ documents: [], total: 0 });

    await expect(appwriteDocumentStore.findOne('widgets', { equal: { slug: 'missing' } })).resolves.toBeNull();
  });

  it('always forces limit(1) even if the caller passed a different limit', async () => {
    mocks.listDocuments.mockResolvedValueOnce({ documents: [], total: 0 });

    await appwriteDocumentStore.findOne('widgets', { limit: 50 });

    expect(mocks.queryLimit).toHaveBeenCalledWith(1);
    expect(mocks.queryLimit).not.toHaveBeenCalledWith(50);
  });
});

describe('appwriteDocumentStore.getById', () => {
  it('returns the mapped document when found', async () => {
    mocks.getDocument.mockResolvedValueOnce(appwriteDoc({ name: 'Rose' }));

    const result = await appwriteDocumentStore.getById('widgets', 'doc-1');

    expect(result).toMatchObject({ id: 'doc-1', name: 'Rose' });
    expect(mocks.getDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'doc-1',
    });
  });

  it('returns null when Appwrite throws (document not found)', async () => {
    mocks.getDocument.mockRejectedValueOnce(new Error('not found'));

    await expect(appwriteDocumentStore.getById('widgets', 'missing')).resolves.toBeNull();
  });
});

describe('appwriteDocumentStore.create', () => {
  it('creates a document using ID.custom and returns the mapped record', async () => {
    mocks.createDocument.mockResolvedValueOnce(appwriteDoc({ $id: 'new-id', name: 'Rose' }));

    const result = await appwriteDocumentStore.create('widgets', 'new-id', { name: 'Rose' });

    expect(mocks.idCustom).toHaveBeenCalledWith('new-id');
    expect(mocks.createDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'custom:new-id',
      data: { name: 'Rose' },
    });
    expect(result).toMatchObject({ id: 'new-id', name: 'Rose' });
  });

  it('maps Appwrite 409 to ConflictError', async () => {
    mocks.createDocument.mockRejectedValueOnce(new MockAppwriteException('conflict', 409));

    await expect(appwriteDocumentStore.create('widgets', 'new-id', { name: 'Rose' })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('rethrows non-409 Appwrite errors unchanged', async () => {
    const failure = new MockAppwriteException('server error', 500);
    mocks.createDocument.mockRejectedValueOnce(failure);

    await expect(appwriteDocumentStore.create('widgets', 'new-id', { name: 'Rose' })).rejects.toBe(failure);
  });
});

describe('appwriteDocumentStore.update', () => {
  it('updates a document and returns the mapped record', async () => {
    mocks.updateDocument.mockResolvedValueOnce(appwriteDoc({ name: 'Updated' }));

    const result = await appwriteDocumentStore.update('widgets', 'doc-1', { name: 'Updated' });

    expect(mocks.updateDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'doc-1',
      data: { name: 'Updated' },
    });
    expect(result).toMatchObject({ id: 'doc-1', name: 'Updated' });
  });

  it('maps Appwrite 409 to ConflictError', async () => {
    mocks.updateDocument.mockRejectedValueOnce(new MockAppwriteException('conflict', 409));

    await expect(appwriteDocumentStore.update('widgets', 'doc-1', { name: 'Updated' })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});

describe('appwriteDocumentStore.delete', () => {
  it('deletes a document', async () => {
    mocks.deleteDocument.mockResolvedValueOnce(undefined);

    await appwriteDocumentStore.delete('widgets', 'doc-1');

    expect(mocks.deleteDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'doc-1',
    });
  });
});

describe('appwriteDocumentStore.runInTransaction', () => {
  it('commits the transaction when the work succeeds', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });

    const result = await appwriteDocumentStore.runInTransaction(async () => 'ok');

    expect(result).toBe('ok');
    expect(mocks.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx-1', commit: true });
  });

  it('rolls back and rethrows when the work fails', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });
    const failure = new Error('boom');

    await expect(
      appwriteDocumentStore.runInTransaction(async () => {
        throw failure;
      }),
    ).rejects.toThrow('boom');

    expect(mocks.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx-1', rollback: true });
  });

  it('exposes a bulkUpdate handle that maps operations onto createOperations', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });

    await appwriteDocumentStore.runInTransaction(async (tx) => {
      await tx.bulkUpdate([
        { collectionId: 'widgets', id: 'w1', data: { displayOrder: 1 } },
        { collectionId: 'gadgets', id: 'g1', data: { displayOrder: 2 } },
      ]);
    });

    expect(mocks.createOperations).toHaveBeenCalledWith({
      transactionId: 'tx-1',
      operations: [
        { action: 'update', databaseId: 'test-db', collectionId: 'widgets', documentId: 'w1', data: { displayOrder: 1 } },
        { action: 'update', databaseId: 'test-db', collectionId: 'gadgets', documentId: 'g1', data: { displayOrder: 2 } },
      ],
    });
  });

  it('exposes a bulkDelete handle that maps operations onto createOperations', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });

    await appwriteDocumentStore.runInTransaction(async (tx) => {
      await tx.bulkDelete([
        { collectionId: 'widgets', id: 'w1' },
        { collectionId: 'gadgets', id: 'g1' },
      ]);
    });

    expect(mocks.createOperations).toHaveBeenCalledWith({
      transactionId: 'tx-1',
      operations: [
        { action: 'delete', databaseId: 'test-db', collectionId: 'widgets', documentId: 'w1' },
        { action: 'delete', databaseId: 'test-db', collectionId: 'gadgets', documentId: 'g1' },
      ],
    });
  });

  it('exposes a create handle scoped to the transaction', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });
    mocks.createDocument.mockResolvedValueOnce(appwriteDoc({ $id: 'new-id', name: 'Rose' }));

    const created = await appwriteDocumentStore.runInTransaction((tx) =>
      tx.create('widgets', 'new-id', { name: 'Rose' }),
    );

    expect(mocks.createDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'custom:new-id',
      transactionId: 'tx-1',
      data: { name: 'Rose' },
    });
    expect(created).toMatchObject({ id: 'new-id', name: 'Rose' });
  });

  it('maps transaction create 409 to ConflictError and rolls back', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });
    mocks.createDocument.mockRejectedValueOnce(new MockAppwriteException('conflict', 409));

    await expect(
      appwriteDocumentStore.runInTransaction((tx) => tx.create('widgets', 'new-id', { name: 'Rose' })),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(mocks.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx-1', rollback: true });
  });

  it('maps transaction update 409 to ConflictError and rolls back', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });
    mocks.updateDocument.mockRejectedValueOnce(new MockAppwriteException('conflict', 409));

    await expect(
      appwriteDocumentStore.runInTransaction((tx) => tx.update('widgets', 'doc-1', { name: 'Updated' })),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(mocks.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx-1', rollback: true });
  });

  it('exposes an update handle scoped to the transaction', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });
    mocks.updateDocument.mockResolvedValueOnce(appwriteDoc({ name: 'Updated' }));

    const updated = await appwriteDocumentStore.runInTransaction((tx) =>
      tx.update('widgets', 'doc-1', { name: 'Updated' }),
    );

    expect(mocks.updateDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'doc-1',
      transactionId: 'tx-1',
      data: { name: 'Updated' },
    });
    expect(updated).toMatchObject({ id: 'doc-1', name: 'Updated' });
  });

  it('exposes a delete handle scoped to the transaction', async () => {
    mocks.createTransaction.mockResolvedValueOnce({ $id: 'tx-1' });
    mocks.deleteDocument.mockResolvedValueOnce(undefined);

    await appwriteDocumentStore.runInTransaction((tx) => tx.delete('widgets', 'doc-1'));

    expect(mocks.deleteDocument).toHaveBeenCalledWith({
      databaseId: 'test-db',
      collectionId: 'widgets',
      documentId: 'doc-1',
      transactionId: 'tx-1',
    });
  });
});
