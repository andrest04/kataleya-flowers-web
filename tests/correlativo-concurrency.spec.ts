import { expect, test } from '@playwright/test';
import { Client, Databases, ID } from 'node-appwrite';

const CONCURRENCY = 10;
const TEST_DOC_PREFIX = 'tcc';
const APPWRITE_DATABASE_ID = 'kataleya';
const COUNTERS_COLLECTION_ID = 'counters';

const hasAppwriteEnv =
  Boolean(process.env.APPWRITE_ENDPOINT) &&
  Boolean(process.env.APPWRITE_PROJECT_ID) &&
  Boolean(process.env.APPWRITE_API_KEY);

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

test.describe('Correlativo concurrency — Appwrite atomic counter', () => {
  test.skip(
    !hasAppwriteEnv,
    'Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY to run concurrency tests against a staging Appwrite project.',
  );

  test(
    `${CONCURRENCY} concurrent allocations produce distinct gap-free values`,
    async () => {
      const databases = makeClient();

      const runId = ID.unique();
      const documentId = `${TEST_DOC_PREFIX}-${runId}`;

      const results = await Promise.all(
        Array.from({ length: CONCURRENCY }, () =>
          allocateTestCorrelativo(databases, documentId),
        ),
      );

      for (const v of results) {
        expect(Number.isInteger(v)).toBe(true);
      }

      const unique = new Set(results);
      expect(unique.size).toBe(CONCURRENCY);

      const sorted = [...results].sort((a, b) => a - b);
      const min = sorted.at(0);
      if (min === undefined) throw new Error('No results returned');
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).toBe(min + i);
      }
    },
  );
});
