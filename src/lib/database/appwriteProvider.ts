import type { Models } from 'node-appwrite';
import { ID, Query } from 'node-appwrite';

import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';

import type {
  BulkDeleteOperation,
  BulkUpdateOperation,
  DocumentRecord,
  DocumentStore,
  QuerySpec,
  TransactionHandle,
} from './types';

const APPWRITE_PAGE_SIZE = 100;

function getContext(): {
  databases: ReturnType<typeof createAdminClient>['databases'];
  databaseId: string;
} {
  const { databases } = createAdminClient();
  const { databaseId } = getAppwriteConfig();
  return { databases, databaseId };
}

function toRecord<T extends DocumentRecord>(doc: Models.Document): T {
  const { $id, $createdAt, $updatedAt, $collectionId, $databaseId, $permissions, $sequence, ...rest } =
    doc as unknown as Record<string, unknown> & Models.Document;
  void $collectionId;
  void $databaseId;
  void $permissions;
  void $sequence;
  return { ...rest, id: $id, createdAt: $createdAt, updatedAt: $updatedAt } as unknown as T;
}

function buildFilterQueries(query: QuerySpec | undefined): string[] {
  const queries: string[] = [];
  if (!query) return queries;

  if (query.select) {
    queries.push(Query.select(query.select));
  }
  if (query.equal) {
    for (const [field, value] of Object.entries(query.equal)) {
      queries.push(Query.equal(field, value));
    }
  }
  if (query.orderBy) {
    queries.push(
      query.orderBy.direction === 'desc'
        ? Query.orderDesc(query.orderBy.field)
        : Query.orderAsc(query.orderBy.field),
    );
  }

  return queries;
}

class AppwriteDocumentStore implements DocumentStore {
  async listAll<T extends DocumentRecord>(collectionId: string, query?: QuerySpec): Promise<T[]> {
    const { databases, databaseId } = getContext();
    const filterQueries = buildFilterQueries(query);

    if (query?.limit !== undefined) {
      const pageQueries = [...filterQueries, Query.limit(query.limit)];
      if (query.cursorAfterId) {
        pageQueries.push(Query.cursorAfter(query.cursorAfterId));
      }
      const page = await databases.listDocuments({ databaseId, collectionId, queries: pageQueries });
      return page.documents.map((doc) => toRecord<T>(doc));
    }

    const all: T[] = [];
    let cursor = query?.cursorAfterId;

    for (;;) {
      const pageQueries = [...filterQueries, Query.limit(APPWRITE_PAGE_SIZE)];
      if (cursor) {
        pageQueries.push(Query.cursorAfter(cursor));
      }

      const page = await databases.listDocuments({ databaseId, collectionId, queries: pageQueries });
      all.push(...page.documents.map((doc) => toRecord<T>(doc)));

      if (page.documents.length < APPWRITE_PAGE_SIZE) {
        break;
      }
      cursor = page.documents[page.documents.length - 1].$id;
    }

    return all;
  }

  async findOne<T extends DocumentRecord>(collectionId: string, query: QuerySpec): Promise<T | null> {
    const { databases, databaseId } = getContext();
    const queries = [...buildFilterQueries(query), Query.limit(1)];
    const page = await databases.listDocuments({ databaseId, collectionId, queries });
    const doc = page.documents[0];
    return doc ? toRecord<T>(doc) : null;
  }

  async getById<T extends DocumentRecord>(collectionId: string, id: string): Promise<T | null> {
    const { databases, databaseId } = getContext();
    try {
      const doc = await databases.getDocument({ databaseId, collectionId, documentId: id });
      return toRecord<T>(doc);
    } catch {
      return null;
    }
  }

  async create<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    const { databases, databaseId } = getContext();
    const doc = await databases.createDocument({
      databaseId,
      collectionId,
      documentId: ID.custom(id),
      data,
    });
    return toRecord<T>(doc);
  }

  async update<T extends DocumentRecord>(
    collectionId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    const { databases, databaseId } = getContext();
    const doc = await databases.updateDocument({ databaseId, collectionId, documentId: id, data });
    return toRecord<T>(doc);
  }

  async delete(collectionId: string, id: string): Promise<void> {
    const { databases, databaseId } = getContext();
    await databases.deleteDocument({ databaseId, collectionId, documentId: id });
  }

  async runInTransaction<T>(work: (tx: TransactionHandle) => Promise<T>): Promise<T> {
    const { databases, databaseId } = getContext();
    const transaction = await databases.createTransaction({ ttl: 60 });

    const handle: TransactionHandle = {
      create: async <T extends DocumentRecord>(
        collectionId: string,
        id: string,
        data: Record<string, unknown>,
      ): Promise<T> => {
        const doc = await databases.createDocument({
          databaseId,
          collectionId,
          documentId: ID.custom(id),
          transactionId: transaction.$id,
          data,
        });
        return toRecord<T>(doc);
      },
      update: async <T extends DocumentRecord>(
        collectionId: string,
        id: string,
        data: Record<string, unknown>,
      ): Promise<T> => {
        const doc = await databases.updateDocument({
          databaseId,
          collectionId,
          documentId: id,
          transactionId: transaction.$id,
          data,
        });
        return toRecord<T>(doc);
      },
      delete: async (collectionId: string, id: string) => {
        await databases.deleteDocument({
          databaseId,
          collectionId,
          documentId: id,
          transactionId: transaction.$id,
        });
      },
      bulkUpdate: async (ops: BulkUpdateOperation[]) => {
        await databases.createOperations({
          transactionId: transaction.$id,
          operations: ops.map((op) => ({
            action: 'update' as const,
            databaseId,
            collectionId: op.collectionId,
            documentId: op.id,
            data: op.data,
          })),
        });
      },
      bulkDelete: async (ops: BulkDeleteOperation[]) => {
        await databases.createOperations({
          transactionId: transaction.$id,
          operations: ops.map((op) => ({
            action: 'delete' as const,
            databaseId,
            collectionId: op.collectionId,
            documentId: op.id,
          })),
        });
      },
    };

    try {
      const result = await work(handle);
      await databases.updateTransaction({ transactionId: transaction.$id, commit: true });
      return result;
    } catch (error) {
      try {
        await databases.updateTransaction({ transactionId: transaction.$id, rollback: true });
      } catch (rollbackError) {
        console.error('[database] failed to roll back transaction', {
          transactionId: transaction.$id,
          rollbackError: rollbackError instanceof Error ? rollbackError.message : rollbackError,
        });
      }
      throw error;
    }
  }
}

export const appwriteDocumentStore: DocumentStore = new AppwriteDocumentStore();
