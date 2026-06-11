/**
 * Correlativo concurrency test — Appwrite backend only.
 *
 * Verifies that concurrent calls to `allocateCorrelativo` produce DISTINCT,
 * GAP-FREE sequential values with NO duplicates. This validates the atomic
 * `incrementDocumentAttribute` contract (design D2).
 *
 * Gate: skipped automatically unless all three Appwrite env vars are set
 * (APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY). Never runs in CI
 * unless those vars are explicitly injected — safe against accidental production
 * writes.
 *
 * How to run manually:
 *   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
 *   APPWRITE_PROJECT_ID=<id> \
 *   APPWRITE_API_KEY=<key> \
 *   BACKEND=appwrite \
 *   npx playwright test correlativo-concurrency
 *
 * The test writes to the `counters` collection of the configured project. Use a
 * staging project — never point at the production Appwrite project.
 *
 * Cleanup: the counter doc created (or incremented) by this test is NOT deleted
 * automatically; its year key is `test-concurrency-{runId}` (distinct from the
 * real `complaints-{YYYY}` key) so it does not pollute the seed counter.
 */
import { expect, test } from '@playwright/test';
import { Client, Databases, ID } from 'node-appwrite';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONCURRENCY = 10;
const TEST_DOC_PREFIX = 'test-concurrency'; // keeps separate from real complaints-{YYYY}
const APPWRITE_DATABASE_ID = 'kataleya';
const COUNTERS_COLLECTION_ID = 'counters';

const hasAppwriteEnv =
  Boolean(process.env.APPWRITE_ENDPOINT) &&
  Boolean(process.env.APPWRITE_PROJECT_ID) &&
  Boolean(process.env.APPWRITE_API_KEY);

/** Creates a fresh admin Appwrite Databases client from env vars. */
function makeClient(): Databases {
  const endpoint = process.env.APPWRITE_ENDPOINT ?? '';
  const projectId = process.env.APPWRITE_PROJECT_ID ?? '';
  const apiKey = process.env.APPWRITE_API_KEY ?? '';
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  return new Databases(client);
}

interface CounterDoc {
  value: number;
}

interface AppwriteError {
  code?: number;
}

/**
 * Atomically allocates the next value for the given counter document id.
 * Mirrors `allocateCorrelativo` from the complaints repo but uses a
 * `test-concurrency-{runId}` doc id to avoid polluting the real counter.
 *
 * Uses `any` cast for `incrementDocumentAttribute` because the node-appwrite
 * TS overloads do not expose it as a generic method in all SDK versions.
 */
async function allocateTestCorrelativo(
  databases: Databases,
  documentId: string,
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- node-appwrite overload not narrowed
  const db = databases as any;

  try {
    const updated = (await db.incrementDocumentAttribute({
      databaseId: APPWRITE_DATABASE_ID,
      collectionId: COUNTERS_COLLECTION_ID,
      documentId,
      attribute: 'value',
      value: 1,
    })) as CounterDoc;
    return updated.value;
  } catch (err: unknown) {
    const e = err as AppwriteError;
    if (e.code !== 404) throw err;

    try {
      const created = (await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COUNTERS_COLLECTION_ID,
        documentId,
        { value: 1 },
      )) as unknown as CounterDoc;
      return created.value;
    } catch (createErr: unknown) {
      const ce = createErr as AppwriteError;
      if (ce.code !== 409) throw createErr;

      const retried = (await db.incrementDocumentAttribute({
        databaseId: APPWRITE_DATABASE_ID,
        collectionId: COUNTERS_COLLECTION_ID,
        documentId,
        attribute: 'value',
        value: 1,
      })) as CounterDoc;
      return retried.value;
    }
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Correlativo concurrency — Appwrite atomic counter', () => {
  test.skip(
    !hasAppwriteEnv,
    'Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY to run concurrency tests against a staging Appwrite project.',
  );

  test(
    `${CONCURRENCY} concurrent allocations produce distinct gap-free values`,
    async () => {
      const databases = makeClient();

      // Use a unique doc id per test run so parallel CI shards (if ever) never
      // conflict, and so the test is idempotent across reruns.
      const runId = ID.unique();
      const documentId = `${TEST_DOC_PREFIX}-${runId}`;

      // Fire CONCURRENCY allocations simultaneously — this is the stress path.
      const results = await Promise.all(
        Array.from({ length: CONCURRENCY }, () =>
          allocateTestCorrelativo(databases, documentId),
        ),
      );

      // All values must be integers.
      for (const v of results) {
        expect(Number.isInteger(v)).toBe(true);
      }

      // All values must be unique — no duplicate correlativos.
      const unique = new Set(results);
      expect(unique.size).toBe(CONCURRENCY);

      // Values must be gap-free: sorted set equals [min, min+1, ..., min+N-1].
      const sorted = [...results].sort((a, b) => a - b);
      const min = sorted.at(0);
      if (min === undefined) throw new Error('No results returned');
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).toBe(min + i);
      }
    },
  );
});
