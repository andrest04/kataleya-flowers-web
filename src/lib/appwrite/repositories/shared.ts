import type { Models } from 'node-appwrite';
import { Query } from 'node-appwrite';

import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';

export const APPWRITE_PAGE_SIZE = 100;

export function getRepositoryContext(): {
  databases: ReturnType<typeof createAdminClient>['databases'];
  databaseId: string;
} {
  const { databases } = createAdminClient();
  const { databaseId } = getAppwriteConfig();
  return { databases, databaseId };
}

export async function listAllDocuments<Doc extends Models.Document>(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
  collectionId: string,
  queries: string[] = [],
): Promise<Doc[]> {
  const all: Doc[] = [];
  let cursor: string | null = null;

  for (;;) {
    const pageQueries = [...queries, Query.limit(APPWRITE_PAGE_SIZE)];
    if (cursor) {
      pageQueries.push(Query.cursorAfter(cursor));
    }

    const page = await databases.listDocuments<Doc>({
      databaseId,
      collectionId,
      queries: pageQueries,
    });

    all.push(...page.documents);

    if (page.documents.length < APPWRITE_PAGE_SIZE) {
      break;
    }
    cursor = page.documents[page.documents.length - 1].$id;
  }

  return all;
}

export async function findOneDocument<Doc extends Models.Document>(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
  collectionId: string,
  queries: string[] = [],
): Promise<Doc | null> {
  const page = await databases.listDocuments<Doc>({
    databaseId,
    collectionId,
    queries: [...queries, Query.limit(1)],
  });
  return page.documents[0] ?? null;
}

export function chunkIds(ids: string[]): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += APPWRITE_PAGE_SIZE) {
    chunks.push(ids.slice(i, i + APPWRITE_PAGE_SIZE));
  }
  return chunks;
}
