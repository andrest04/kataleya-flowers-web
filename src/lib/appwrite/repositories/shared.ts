// Server-only: shared helpers for Appwrite repositories.
//
// Repositories return rows shaped exactly like the Supabase row contracts
// (`JoinedProductRow`, `CategoryRow`, etc.) so the existing mappers and admin
// consumers stay byte-for-byte unchanged. No Appwrite document types leak past
// this boundary — `$id`/`$createdAt`/`$updatedAt` are translated to the
// `id`/`created_at`/`updated_at` field names the rest of the app expects.
import type { Models } from 'node-appwrite';
import { Query } from 'node-appwrite';

import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';

/**
 * Appwrite caps each `listDocuments` page at 100 documents (and Query.equal
 * `in`-lists at 100 values). Repositories paginate with this constant to fetch
 * complete result sets, matching Supabase's unbounded `select`.
 */
export const APPWRITE_PAGE_SIZE = 100;

/** Resolves the shared admin databases client + database id for repositories. */
export function getRepositoryContext(): {
  databases: ReturnType<typeof createAdminClient>['databases'];
  databaseId: string;
} {
  const { databases } = createAdminClient();
  const { databaseId } = getAppwriteConfig();
  return { databases, databaseId };
}

/**
 * Fetches every document in a collection matching `queries`, transparently
 * paginating past Appwrite's 100-doc page cap with a cursor. `queries` MUST NOT
 * already contain a `limit`/`offset`/`cursorAfter` term — this helper owns
 * pagination. Ordering terms in `queries` are preserved across pages.
 */
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

/**
 * Fetches at most one document matching `queries`. Unlike `listAllDocuments`,
 * this helper owns the `limit(1)` term and returns the first document or null.
 * Use this for single-doc lookups (slug resolution, category lookup) where
 * cursor pagination is unnecessary and a caller-supplied limit would conflict.
 */
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

/**
 * Splits ids into chunks no larger than `APPWRITE_PAGE_SIZE` so each is a valid
 * `Query.equal(attribute, chunk)` in-list (Appwrite caps in-lists at 100).
 */
export function chunkIds(ids: string[]): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += APPWRITE_PAGE_SIZE) {
    chunks.push(ids.slice(i, i + APPWRITE_PAGE_SIZE));
  }
  return chunks;
}
