/**
 * Verify the Appwrite import against the Supabase export.
 *
 * Checks:
 *   1. Row-count parity: each collection has the same number of documents as
 *      the source data/ JSON file.
 *   2. Spot-check: samples the first and last record of products, categories,
 *      complaints and verifies key fields (id, slug/correlativo) are present.
 *   3. FK spot-check: for the first 5 products, verifies that their
 *      category_id resolves to an existing category document.
 *   4. Counter check: for each complaint year, verifies the counter document
 *      exists and its value equals max(correlativo) for that year.
 *
 * Usage:
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
 *     npx tsx scripts/migration/verify.ts
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks FAILED
 */

import fs from 'node:fs';
import path from 'node:path';

import type { Models } from 'node-appwrite';
import { AppwriteException, Query } from 'node-appwrite';

import {
  APPWRITE_COLLECTIONS,
  APPWRITE_DATABASE_ID,
  createAdminClient,
} from './lib/appwrite-client';

const DATA_DIR = path.join(import.meta.dirname, 'data');
const C = APPWRITE_COLLECTIONS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson<T>(filename: string): T[] {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Data file not found: ${filepath}. Run export-supabase.ts first.`);
  }
  const raw: unknown = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  if (
    typeof raw !== 'object' ||
    raw === null ||
    !('rows' in raw) ||
    !Array.isArray((raw as Record<string, unknown>).rows)
  ) {
    throw new Error(`Invalid data file: ${filepath}`);
  }
  return (raw as { rows: T[] }).rows;
}

type Databases = ReturnType<typeof createAdminClient>['databases'];

async function countDocuments(
  databases: Databases,
  databaseId: string,
  collectionId: string,
): Promise<number> {
  // Appwrite returns total in the list response (all items, not just the page).
  const page = await databases.listDocuments({
    databaseId,
    collectionId,
    queries: [Query.limit(1)],
  });
  return page.total;
}

async function documentExists(
  databases: Databases,
  databaseId: string,
  collectionId: string,
  documentId: string,
): Promise<boolean> {
  try {
    await databases.getDocument({ databaseId, collectionId, documentId });
    return true;
  } catch (err) {
    if (err instanceof AppwriteException && err.code === 404) return false;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Check types
// ---------------------------------------------------------------------------

type CheckStatus = 'PASS' | 'FAIL' | 'WARN';

interface CheckResult {
  name: string;
  status: CheckStatus;
  detail: string;
}

const results: CheckResult[] = [];

function pass(name: string, detail: string): void {
  results.push({ name, status: 'PASS', detail });
}

function fail(name: string, detail: string): void {
  results.push({ name, status: 'FAIL', detail });
}

function warn(name: string, detail: string): void {
  results.push({ name, status: 'WARN', detail });
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

interface SupabaseProduct { id: string; slug: string; category_id: string; }
interface SupabaseCategory { id: string; slug: string; }
interface SupabaseComplaint { id: string; correlativo: number; created_at: string; }
interface AppwriteDoc extends Models.Document { slug?: string; correlativo?: number; value?: number; category_id?: string; }

async function checkRowCounts(databases: Databases, databaseId: string): Promise<void> {
  const checks: { file: string; collection: string }[] = [
    { file: 'categories.json', collection: C.categories },
    { file: 'colors.json', collection: C.colors },
    { file: 'flower_types.json', collection: C.flowerTypes },
    { file: 'products.json', collection: C.products },
    { file: 'product_images.json', collection: C.productImages },
    { file: 'product_color_assignments.json', collection: C.colorAssignments },
    { file: 'product_flower_type_assignments.json', collection: C.flowerTypeAssignments },
    { file: 'complaints.json', collection: C.complaints },
  ];

  for (const { file, collection } of checks) {
    const sourceRows = readJson<Record<string, unknown>>(file);
    const sourceCount = sourceRows.length;
    const appwriteCount = await countDocuments(databases, databaseId, collection);

    if (appwriteCount === sourceCount) {
      pass(`row-count/${collection}`, `${appwriteCount} docs (matches source)`);
    } else {
      fail(
        `row-count/${collection}`,
        `Appwrite=${appwriteCount}, source=${sourceCount} — delta=${appwriteCount - sourceCount}`,
      );
    }
  }
}

async function checkSpotSamples(databases: Databases, databaseId: string): Promise<void> {
  // Products: first + last by display_order
  const productRows = readJson<SupabaseProduct>('products.json');
  for (const row of [productRows[0], productRows[productRows.length - 1]].filter(Boolean)) {
    const exists = await documentExists(databases, databaseId, C.products, row.id);
    if (exists) {
      const doc = await databases.getDocument<AppwriteDoc>({ databaseId, collectionId: C.products, documentId: row.id });
      if (doc.slug === row.slug) {
        pass(`spot/products/${row.id}`, `slug="${row.slug}" matches`);
      } else {
        fail(`spot/products/${row.id}`, `slug mismatch: appwrite="${doc.slug ?? 'null'}", source="${row.slug}"`);
      }
    } else {
      fail(`spot/products/${row.id}`, `document not found`);
    }
  }

  // Categories: first + last
  const categoryRows = readJson<SupabaseCategory>('categories.json');
  for (const row of [categoryRows[0], categoryRows[categoryRows.length - 1]].filter(Boolean)) {
    const exists = await documentExists(databases, databaseId, C.categories, row.id);
    if (exists) {
      const doc = await databases.getDocument<AppwriteDoc>({ databaseId, collectionId: C.categories, documentId: row.id });
      if (doc.slug === row.slug) {
        pass(`spot/categories/${row.id}`, `slug="${row.slug}" matches`);
      } else {
        fail(`spot/categories/${row.id}`, `slug mismatch: appwrite="${doc.slug ?? 'null'}", source="${row.slug}"`);
      }
    } else {
      fail(`spot/categories/${row.id}`, `document not found`);
    }
  }

  // Complaints: first + last by correlativo
  const complaintRows = readJson<SupabaseComplaint>('complaints.json')
    .sort((a, b) => a.correlativo - b.correlativo);
  for (const row of [complaintRows[0], complaintRows[complaintRows.length - 1]].filter(Boolean)) {
    const exists = await documentExists(databases, databaseId, C.complaints, row.id);
    if (exists) {
      const doc = await databases.getDocument<AppwriteDoc>({ databaseId, collectionId: C.complaints, documentId: row.id });
      if (doc.correlativo === row.correlativo) {
        pass(`spot/complaints/${row.id}`, `correlativo=${row.correlativo} matches`);
      } else {
        fail(`spot/complaints/${row.id}`, `correlativo mismatch: appwrite=${doc.correlativo ?? 'null'}, source=${row.correlativo}`);
      }
    } else {
      fail(`spot/complaints/${row.id}`, `document not found`);
    }
  }
}

async function checkForeignKeys(databases: Databases, databaseId: string): Promise<void> {
  const productRows = readJson<SupabaseProduct>('products.json').slice(0, 5);
  for (const row of productRows) {
    const categoryExists = await documentExists(databases, databaseId, C.categories, row.category_id);
    if (categoryExists) {
      pass(`fk/products/${row.id}/category_id`, `category ${row.category_id} exists`);
    } else {
      fail(`fk/products/${row.id}/category_id`, `category ${row.category_id} NOT found — broken FK`);
    }
  }
}

async function checkCounters(databases: Databases, databaseId: string): Promise<void> {
  const complaintRows = readJson<SupabaseComplaint>('complaints.json');

  if (complaintRows.length === 0) {
    warn('counter/no-complaints', 'No complaints in source — counter check skipped');
    return;
  }

  // Compute max correlativo per year from source data.
  const maxPerYear = new Map<number, number>();
  for (const row of complaintRows) {
    const year = new Date(row.created_at).getFullYear();
    const current = maxPerYear.get(year) ?? 0;
    if (row.correlativo > current) maxPerYear.set(year, row.correlativo);
  }

  for (const [year, max] of Array.from(maxPerYear.entries()).sort(([a], [b]) => a - b)) {
    const docId = `complaints-${year}`;
    try {
      const doc = await databases.getDocument<AppwriteDoc>({
        databaseId,
        collectionId: C.counters,
        documentId: docId,
      });

      if (typeof doc.value === 'number' && doc.value >= max) {
        pass(`counter/${docId}`, `value=${doc.value} >= source max ${max} — next correlativo will be ${doc.value + 1}`);
      } else {
        fail(
          `counter/${docId}`,
          `value=${doc.value ?? 'null'} < source max ${max} — run seed-counter.ts before cutover`,
        );
      }
    } catch (err) {
      if (err instanceof AppwriteException && err.code === 404) {
        fail(`counter/${docId}`, `counter document missing — run seed-counter.ts before cutover`);
      } else {
        throw err;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function printReport(): boolean {
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warned = results.filter((r) => r.status === 'WARN').length;

  console.log('\n=== Verification Report ===\n');

  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'WARN';
    console.log(`  [${icon}] ${r.name}`);
    console.log(`         ${r.detail}`);
  }

  console.log('\n--- Summary ---');
  console.log(`  PASS: ${passed}  FAIL: ${failed}  WARN: ${warned}`);

  if (failed > 0) {
    console.error(`\nVerification FAILED — ${failed} check(s) did not pass. Review above before cutover.`);
    return false;
  }

  console.log('\nAll checks passed. The import appears complete and consistent.');
  if (warned > 0) {
    console.warn(`${warned} warning(s) noted — review but not blocking.`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`Verifying Appwrite database: ${APPWRITE_DATABASE_ID}`);
  console.log(`Source data directory: ${DATA_DIR}\n`);

  const { databases } = createAdminClient();
  const databaseId = APPWRITE_DATABASE_ID;

  console.log('Checking row counts...');
  await checkRowCounts(databases, databaseId);

  console.log('Checking spot samples...');
  await checkSpotSamples(databases, databaseId);

  console.log('Checking foreign keys...');
  await checkForeignKeys(databases, databaseId);

  console.log('Checking correlativo counters...');
  await checkCounters(databases, databaseId);

  const ok = printReport();
  process.exit(ok ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error('verify failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
