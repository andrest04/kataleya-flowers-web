import type {
  BulkDeleteOperation,
  BulkUpdateOperation,
  DocumentRecord,
  DocumentStore,
  QuerySpec,
  TransactionHandle,
} from '../types';

type StoredDocument = DocumentRecord & Record<string, unknown>;

export interface FakeDocumentStore extends DocumentStore {
  reset(): void;
  seed<T extends DocumentRecord>(collectionId: string, doc: T): void;
}

function matchesEqual(doc: StoredDocument, equal: QuerySpec['equal']): boolean {
  if (!equal) return true;
  return Object.entries(equal).every(([field, value]) => {
    const docValue = doc[field];
    if (Array.isArray(value)) {
      return typeof docValue === 'string' && value.includes(docValue);
    }
    return docValue === value;
  });
}

function compareByField(a: StoredDocument, b: StoredDocument, field: string): number {
  const left = a[field];
  const right = b[field];
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left).localeCompare(String(right));
}

function project<T extends DocumentRecord>(doc: StoredDocument, select?: string[]): T {
  if (!select || select.length === 0) {
    return { ...doc } as unknown as T;
  }

  const projected: StoredDocument = { id: doc.id, createdAt: doc.createdAt, updatedAt: doc.updatedAt };
  for (const field of select) {
    projected[field] = doc[field];
  }
  return projected as unknown as T;
}

class InMemoryDocumentStore implements FakeDocumentStore {
  private readonly collections = new Map<string, Map<string, StoredDocument>>();

  private collection(collectionId: string): Map<string, StoredDocument> {
    const existing = this.collections.get(collectionId);
    if (existing) return existing;

    const created = new Map<string, StoredDocument>();
    this.collections.set(collectionId, created);
    return created;
  }

  private queryDocuments(collectionId: string, query?: QuerySpec): StoredDocument[] {
    let docs = Array.from(this.collection(collectionId).values()).filter((doc) =>
      matchesEqual(doc, query?.equal),
    );

    if (query?.orderBy) {
      const { field, direction } = query.orderBy;
      docs = [...docs].sort((a, b) =>
        direction === 'desc' ? compareByField(b, a, field) : compareByField(a, b, field),
      );
    }

    if (query?.cursorAfterId) {
      const cursorIndex = docs.findIndex((doc) => doc.id === query.cursorAfterId);
      docs = docs.slice(cursorIndex + 1);
    }

    if (query?.limit !== undefined) {
      docs = docs.slice(0, query.limit);
    }

    return docs;
  }

  async listAll<T extends DocumentRecord>(collectionId: string, query?: QuerySpec): Promise<T[]> {
    return this.queryDocuments(collectionId, query).map((doc) => project<T>(doc, query?.select));
  }

  async findOne<T extends DocumentRecord>(collectionId: string, query: QuerySpec): Promise<T | null> {
    const [doc] = this.queryDocuments(collectionId, { ...query, limit: 1 });
    return doc ? project<T>(doc, query.select) : null;
  }

  async getById<T extends DocumentRecord>(collectionId: string, id: string): Promise<T | null> {
    const doc = this.collection(collectionId).get(id);
    return doc ? project<T>(doc) : null;
  }

  async create<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    const now = new Date().toISOString();
    const doc: StoredDocument = { ...data, id, createdAt: now, updatedAt: now };
    this.collection(collectionId).set(id, doc);
    return project<T>(doc);
  }

  async update<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    const existing = this.collection(collectionId).get(id);
    if (!existing) {
      throw new Error(`fakeDocumentStore: document not found: ${collectionId}/${id}`);
    }

    const updated: StoredDocument = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.collection(collectionId).set(id, updated);
    return project<T>(updated);
  }

  async delete(collectionId: string, id: string): Promise<void> {
    this.collection(collectionId).delete(id);
  }

  async runInTransaction<T>(work: (tx: TransactionHandle) => Promise<T>): Promise<T> {
    const handle: TransactionHandle = {
      create: (collectionId, id, data) => this.create(collectionId, id, data),
      update: (collectionId, id, data) => this.update(collectionId, id, data),
      delete: (collectionId, id) => this.delete(collectionId, id),
      bulkUpdate: async (ops: BulkUpdateOperation[]) => {
        for (const op of ops) {
          await this.update(op.collectionId, op.id, op.data);
        }
      },
      bulkDelete: async (ops: BulkDeleteOperation[]) => {
        for (const op of ops) {
          await this.delete(op.collectionId, op.id);
        }
      },
    };

    return work(handle);
  }

  reset(): void {
    this.collections.clear();
  }

  seed<T extends DocumentRecord>(collectionId: string, doc: T): void {
    this.collection(collectionId).set(doc.id, { ...doc } as StoredDocument);
  }
}

export function createFakeDocumentStore(): FakeDocumentStore {
  return new InMemoryDocumentStore();
}
