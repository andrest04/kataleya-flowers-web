/**
 * Import Supabase-exported JSON data into the Appwrite `kataleya` database.
 *
 * IDEMPOTENT: if a document already exists (same Supabase UUID as document id)
 * it is skipped with a count reported at the end. Re-running after a partial
 * failure is always safe.
 *
 * FIELD CONSTRAINTS (Appwrite 65,535-byte row budget):
 *   products.price_variants  → capped at 4096 chars; excess triggers a warning
 *   complaints.provider_response → capped at 2000 chars; excess is a HARD FAIL
 *     (legal data — we never silently truncate a provider response)
 *
 * Run AFTER export-supabase.ts and BEFORE seed-counter.ts / seed-admins.ts.
 *
 * Usage:
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
 *     npx tsx scripts/migration/import-appwrite.ts [--dry-run]
 *
 * Flags:
 *   --dry-run   Reads data/ files, validates all records, prints what WOULD be
 *               imported, then exits without writing anything.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { AppwriteException } from 'node-appwrite';

import {
  APPWRITE_COLLECTIONS,
  APPWRITE_DATABASE_ID,
  createAdminClient,
} from './lib/appwrite-client';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(import.meta.dirname, 'data');
const DRY_RUN = process.argv.includes('--dry-run');

const C = APPWRITE_COLLECTIONS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derives a stable, collision-free 36-char document ID for junction rows that
 * have no surrogate UUID in Supabase. Uses the first 36 hex chars of the
 * SHA-256 hash of the composite key — deterministic across re-runs and unique
 * within the collection (2^144 collision resistance is more than sufficient).
 */
function junctionDocId(a: string, b: string): string {
  return crypto.createHash('sha256').update(`${a}_${b}`).digest('hex').slice(0, 36);
}

function readJson<T>(filename: string): T[] {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(
      `Data file not found: ${filepath}\nRun export-supabase.ts first.`,
    );
  }
  const raw: unknown = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  if (
    typeof raw !== 'object' ||
    raw === null ||
    !('rows' in raw) ||
    !Array.isArray((raw as Record<string, unknown>).rows)
  ) {
    throw new Error(`Invalid data file format: ${filepath}`);
  }
  return (raw as { rows: T[] }).rows;
}

/** Returns true if an Appwrite exception is a "document already exists" (409). */
function isConflict(err: unknown): boolean {
  return err instanceof AppwriteException && err.code === 409;
}

interface ImportResult {
  collection: string;
  total: number;
  imported: number;
  skipped: number;
  failed: number;
}

/** Creates a document, skipping silently on 409 conflict. */
async function upsertDocument(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>,
): Promise<'created' | 'skipped'> {
  try {
    await databases.createDocument({
      databaseId,
      collectionId,
      documentId,
      data,
    });
    return 'created';
  } catch (err) {
    if (isConflict(err)) return 'skipped';
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Per-collection import functions
// ---------------------------------------------------------------------------

interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  occasion: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
}

async function importCategories(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseCategory>('categories.json');
  const result: ImportResult = { collection: C.categories, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    const status = await upsertDocument(databases, databaseId, C.categories, row.id, {
      name: row.name,
      slug: row.slug,
      description: row.description,
      image_url: row.image_url ?? null,
      occasion: row.occasion ?? null,
      display_order: row.display_order,
      is_active: row.is_active,
      is_featured: row.is_featured,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseColor {
  id: string;
  name: string;
  label: string;
  hex: string | null;
  display_order: number;
}

async function importColors(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseColor>('colors.json');
  const result: ImportResult = { collection: C.colors, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    const status = await upsertDocument(databases, databaseId, C.colors, row.id, {
      name: row.name,
      label: row.label,
      hex: row.hex ?? null,
      display_order: row.display_order,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseFlowerType {
  id: string;
  name: string;
  display_order: number;
}

async function importFlowerTypes(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseFlowerType>('flower_types.json');
  const result: ImportResult = { collection: C.flowerTypes, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    const status = await upsertDocument(databases, databaseId, C.flowerTypes, row.id, {
      name: row.name,
      display_order: row.display_order,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  includes: unknown;
  colors: string[];
  flower_types: string[];
  occasion: string | null;
  note: string | null;
  price_variants: unknown | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
}

const PRICE_VARIANTS_MAX = 4096;

/**
 * Narrows a Supabase jsonb value to string[]. The Appwrite `includes` column
 * is a string ARRAY attribute (size 500/element), not a serialized JSON string
 * — importing anything else would be rejected by the API.
 */
function toStringArray(value: unknown, context: string): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
    throw new Error(`${context}: expected a JSON array of strings, got: ${JSON.stringify(value).slice(0, 120)}`);
  }
  return value;
}

async function importProducts(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseProduct>('products.json');
  const result: ImportResult = { collection: C.products, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    const includesArr = toStringArray(row.includes, `products/${row.id} includes`);
    let priceVariantsStr: string | null = null;

    if (row.price_variants !== null && row.price_variants !== undefined) {
      const raw = JSON.stringify(row.price_variants);
      if (raw.length > PRICE_VARIANTS_MAX) {
        console.warn(
          `[WARN] products/${row.id} price_variants exceeds ${PRICE_VARIANTS_MAX} chars (${raw.length}) — truncating. Verify manually after import.`,
        );
        priceVariantsStr = raw.slice(0, PRICE_VARIANTS_MAX);
      } else {
        priceVariantsStr = raw;
      }
    }

    const status = await upsertDocument(databases, databaseId, C.products, row.id, {
      category_id: row.category_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      image_url: row.image_url,
      images: row.images ?? [],
      includes: includesArr,
      colors: row.colors ?? [],
      flower_types: row.flower_types ?? [],
      occasion: row.occasion ?? null,
      note: row.note ?? null,
      price_variants: priceVariantsStr,
      display_order: row.display_order,
      is_active: row.is_active,
      is_featured: row.is_featured,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

async function importProductImages(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseProductImage>('product_images.json');
  const result: ImportResult = { collection: C.productImages, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    const status = await upsertDocument(databases, databaseId, C.productImages, row.id, {
      product_id: row.product_id,
      url: row.url,
      alt_text: row.alt_text ?? null,
      is_primary: row.is_primary,
      display_order: row.display_order,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseColorAssignment {
  product_id: string;
  color_id: string;
}

async function importColorAssignments(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseColorAssignment>('product_color_assignments.json');
  const result: ImportResult = { collection: C.colorAssignments, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    // Appwrite requires a document id — derive a stable 36-char id from the
    // composite key (SHA-256 hash prefix, collision-free and idempotent).
    const docId = junctionDocId(row.product_id, row.color_id);
    const status = await upsertDocument(databases, databaseId, C.colorAssignments, docId, {
      product_id: row.product_id,
      color_id: row.color_id,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseFlowerTypeAssignment {
  product_id: string;
  flower_type_id: string;
}

async function importFlowerTypeAssignments(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseFlowerTypeAssignment>('product_flower_type_assignments.json');
  const result: ImportResult = { collection: C.flowerTypeAssignments, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    const docId = junctionDocId(row.product_id, row.flower_type_id);
    const status = await upsertDocument(databases, databaseId, C.flowerTypeAssignments, docId, {
      product_id: row.product_id,
      flower_type_id: row.flower_type_id,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

interface SupabaseComplaint {
  id: string;
  correlativo: number;
  complaint_type: string;
  consumer_name: string;
  consumer_doc_type: string;
  consumer_doc_number: string;
  consumer_email: string;
  consumer_phone: string | null;
  consumer_address: string;
  is_minor: boolean;
  guardian_name: string | null;
  item_type: string;
  item_description: string;
  claimed_amount: number | null;
  detail: string;
  consumer_request: string;
  provider_response: string | null;
  status: string;
  responded_at: string | null;
  email_sent: boolean;
}

const PROVIDER_RESPONSE_MAX = 2000;

async function importComplaints(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
): Promise<ImportResult> {
  const rows = readJson<SupabaseComplaint>('complaints.json');
  const result: ImportResult = { collection: C.complaints, total: rows.length, imported: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    // HARD FAIL on provider_response overflow — legal data must not be silently
    // truncated. The operator must resolve this before cutover.
    if (
      row.provider_response !== null &&
      row.provider_response.length > PROVIDER_RESPONSE_MAX
    ) {
      console.error(
        `[ERROR] complaints/${row.id} (correlativo ${row.correlativo}) provider_response exceeds ${PROVIDER_RESPONSE_MAX} chars (${row.provider_response.length}). ` +
        `This is legal data — import aborted. Shorten the response in Supabase before retrying.`,
      );
      process.exit(1);
    }

    const status = await upsertDocument(databases, databaseId, C.complaints, row.id, {
      correlativo: row.correlativo,
      complaint_type: row.complaint_type,
      consumer_name: row.consumer_name,
      consumer_doc_type: row.consumer_doc_type,
      consumer_doc_number: row.consumer_doc_number,
      consumer_email: row.consumer_email,
      consumer_phone: row.consumer_phone ?? null,
      consumer_address: row.consumer_address,
      is_minor: row.is_minor,
      guardian_name: row.guardian_name ?? null,
      item_type: row.item_type,
      item_description: row.item_description,
      claimed_amount: row.claimed_amount ?? null,
      detail: row.detail,
      consumer_request: row.consumer_request,
      provider_response: row.provider_response ?? null,
      status: row.status,
      responded_at: row.responded_at ?? null,
      email_sent: row.email_sent,
    });
    if (status === 'created') result.imported++;
    else result.skipped++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Dry-run validation
// ---------------------------------------------------------------------------

async function dryRunValidation(): Promise<void> {
  console.log('[DRY RUN] Reading and validating data files — no writes will occur.\n');

  // Validate all files exist by reading them.
  const dataFiles = [
    'categories.json',
    'colors.json',
    'flower_types.json',
    'products.json',
    'product_images.json',
    'product_color_assignments.json',
    'product_flower_type_assignments.json',
    'complaints.json',
  ];

  let hasErrors = false;

  for (const file of dataFiles) {
    try {
      const rows = readJson<Record<string, unknown>>(file);
      console.log(`  ${file.padEnd(45)} ${rows.length} rows — OK`);

      // Validate complaint provider_response lengths.
      if (file === 'complaints.json') {
        const complaints = rows as unknown as SupabaseComplaint[];
        for (const row of complaints) {
          if (
            row.provider_response !== null &&
            row.provider_response !== undefined &&
            row.provider_response.length > PROVIDER_RESPONSE_MAX
          ) {
            console.error(
              `  [ERROR] complaints/${row.id} correlativo=${row.correlativo}: ` +
              `provider_response ${row.provider_response.length} chars > ${PROVIDER_RESPONSE_MAX} limit.`,
            );
            hasErrors = true;
          }
        }
      }

      // Warn on large price_variants.
      if (file === 'products.json') {
        const products = rows as unknown as SupabaseProduct[];
        for (const row of products) {
          if (row.price_variants !== null && row.price_variants !== undefined) {
            const raw = JSON.stringify(row.price_variants);
            if (raw.length > PRICE_VARIANTS_MAX) {
              console.warn(
                `  [WARN] products/${row.id}: price_variants ${raw.length} chars > ${PRICE_VARIANTS_MAX} — will be truncated.`,
              );
            }
          }
        }
      }
    } catch (err) {
      console.error(`  ${file}: ${err instanceof Error ? err.message : String(err)}`);
      hasErrors = true;
    }
  }

  console.log('');
  if (hasErrors) {
    console.error('[DRY RUN] Validation FAILED — fix errors above before importing.');
    process.exit(1);
  }
  console.log('[DRY RUN] Validation passed. Re-run without --dry-run to import.');
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function printReport(results: ImportResult[]): void {
  const width = 45;
  console.log('');
  console.log('  Collection' + ' '.repeat(width - 10) + ' Total  Imported  Skipped  Failed');
  console.log('  ' + '-'.repeat(width + 36));

  let totalImported = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const r of results) {
    const name = r.collection.padEnd(width);
    console.log(
      `  ${name} ${String(r.total).padStart(5)}  ${String(r.imported).padStart(8)}  ${String(r.skipped).padStart(7)}  ${String(r.failed).padStart(6)}`,
    );
    totalImported += r.imported;
    totalSkipped += r.skipped;
    totalFailed += r.failed;
  }

  console.log('  ' + '-'.repeat(width + 36));
  const totals = '  TOTAL' + ' '.repeat(width - 5);
  const totalRows = results.reduce((s, r) => s + r.total, 0);
  console.log(
    `${totals} ${String(totalRows).padStart(5)}  ${String(totalImported).padStart(8)}  ${String(totalSkipped).padStart(7)}  ${String(totalFailed).padStart(6)}`,
  );

  if (totalFailed > 0) {
    console.error(`\n[ERROR] ${totalFailed} documents failed to import. Check logs above.`);
    process.exit(1);
  }

  console.log('\nImport complete.');
  if (totalSkipped > 0) {
    console.log(`${totalSkipped} document(s) already existed and were skipped (idempotent run).`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (DRY_RUN) {
    await dryRunValidation();
    return;
  }

  const { databases } = createAdminClient();
  const databaseId = APPWRITE_DATABASE_ID;

  console.log(`Importing into Appwrite database: ${databaseId}`);
  console.log('');

  const results: ImportResult[] = [];

  // Import order matters: categories before products (FK), colors/flowerTypes
  // before assignments.
  console.log('  Importing categories...');
  results.push(await importCategories(databases, databaseId));

  console.log('  Importing colors...');
  results.push(await importColors(databases, databaseId));

  console.log('  Importing flower types...');
  results.push(await importFlowerTypes(databases, databaseId));

  console.log('  Importing products...');
  results.push(await importProducts(databases, databaseId));

  console.log('  Importing product images...');
  results.push(await importProductImages(databases, databaseId));

  console.log('  Importing color assignments...');
  results.push(await importColorAssignments(databases, databaseId));

  console.log('  Importing flower type assignments...');
  results.push(await importFlowerTypeAssignments(databases, databaseId));

  console.log('  Importing complaints...');
  results.push(await importComplaints(databases, databaseId));

  printReport(results);
}

main().catch((err: unknown) => {
  console.error('Import failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});

// Re-export for use by verify.ts without duplication.
export type { SupabaseComplaint };
