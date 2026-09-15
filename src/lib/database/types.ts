export interface DocumentRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuerySpec {
  equal?: Record<string, string | number | boolean | string[]>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  cursorAfterId?: string;
  select?: string[];
}

export interface BulkUpdateOperation {
  collectionId: string;
  id: string;
  data: Record<string, unknown>;
}

export interface BulkDeleteOperation {
  collectionId: string;
  id: string;
}

export interface TransactionHandle {
  create<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T>;
  update<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T>;
  delete(collectionId: string, id: string): Promise<void>;
  bulkUpdate(ops: BulkUpdateOperation[]): Promise<void>;
  bulkDelete(ops: BulkDeleteOperation[]): Promise<void>;
}

export interface DocumentStore {
  listAll<T extends DocumentRecord>(collectionId: string, query?: QuerySpec): Promise<T[]>;
  findOne<T extends DocumentRecord>(collectionId: string, query: QuerySpec): Promise<T | null>;
  getById<T extends DocumentRecord>(collectionId: string, id: string): Promise<T | null>;
  create<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T>;
  update<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T>;
  delete(collectionId: string, id: string): Promise<void>;
  runInTransaction<T>(work: (tx: TransactionHandle) => Promise<T>): Promise<T>;
}

const DEFAULT_CHUNK_SIZE = 100;

export function chunkIds(ids: string[], size: number = DEFAULT_CHUNK_SIZE): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}
