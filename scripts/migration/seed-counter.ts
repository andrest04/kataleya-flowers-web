/**
 * Seed the Appwrite correlativo counter for each year present in Supabase
 * complaints, setting each counter to max(correlativo) for that year.
 *
 * LEGAL REQUIREMENT (Correlativo Continuity):
 *   The first complaint inserted after cutover MUST have correlativo = max + 1,
 *   with no gaps. This script MUST run immediately before the production deploy
 *   that switches BACKEND=appwrite, after the final Supabase data export and
 *   import have completed.
 *
 * IDEMPOTENT: safe to re-run. If the counter document for a year already exists,
 * it is only updated if the Supabase max is HIGHER than the current counter
 * value. This prevents accidental resets if run after cutover.
 *
 * Usage (run just before cutover deploy):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
 *     npx tsx scripts/migration/seed-counter.ts
 *
 * Flags:
 *   --dry-run   Reads Supabase and prints what values would be seeded, without
 *               writing anything.
 */

import type { Models } from 'node-appwrite';
import { AppwriteException } from 'node-appwrite';

import {
  APPWRITE_COLLECTIONS,
  APPWRITE_DATABASE_ID,
  createAdminClient,
} from './lib/appwrite-client';
import { getSupabaseClient } from './lib/supabase-client';

const DRY_RUN = process.argv.includes('--dry-run');

interface CounterRow extends Models.Document {
  value: number;
}

interface SupabaseComplaintRow {
  correlativo: number;
  created_at: string;
}

/** Reads all correlativos from Supabase and returns max per year. */
async function getSupabaseMaxPerYear(): Promise<Map<number, number>> {
  const supabase = getSupabaseClient();
  const rows: SupabaseComplaintRow[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('complaints')
      .select('correlativo, created_at')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Supabase fetch failed: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as SupabaseComplaintRow[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const maxPerYear = new Map<number, number>();

  for (const row of rows) {
    const year = new Date(row.created_at).getFullYear();
    const current = maxPerYear.get(year) ?? 0;
    if (row.correlativo > current) {
      maxPerYear.set(year, row.correlativo);
    }
  }

  return maxPerYear;
}

/** Returns the current counter value for a year doc, or null if not found. */
async function getCurrentCounterValue(
  databases: ReturnType<typeof createAdminClient>['databases'],
  databaseId: string,
  year: number,
): Promise<number | null> {
  try {
    const doc = await databases.getDocument<CounterRow>({
      databaseId,
      collectionId: APPWRITE_COLLECTIONS.counters,
      documentId: `complaints-${year}`,
    });
    return doc.value;
  } catch (err) {
    if (err instanceof AppwriteException && err.code === 404) return null;
    throw err;
  }
}

async function main(): Promise<void> {
  if (DRY_RUN) {
    console.log('[DRY RUN] Computing counter values — no writes will occur.\n');
  }

  console.log('Reading Supabase complaints to compute max correlativo per year...');
  const maxPerYear = await getSupabaseMaxPerYear();

  if (maxPerYear.size === 0) {
    console.log('No complaints found in Supabase — nothing to seed.');
    return;
  }

  console.log('');
  console.log('  Year   Supabase max   Target (max)   Action');
  console.log('  ' + '-'.repeat(52));

  if (!DRY_RUN) {
    const { databases } = createAdminClient();
    const databaseId = APPWRITE_DATABASE_ID;

    for (const [year, max] of Array.from(maxPerYear.entries()).sort(([a], [b]) => a - b)) {
      const docId = `complaints-${year}`;
      const current = await getCurrentCounterValue(databases, databaseId, year);

      if (current === null) {
        // Counter doc does not exist yet — create it seeded to max.
        await databases.createDocument({
          databaseId,
          collectionId: APPWRITE_COLLECTIONS.counters,
          documentId: docId,
          data: { value: max },
        });
        console.log(`  ${year}   ${String(max).padStart(13)}   ${String(max).padStart(13)}   created (seeded to ${max})`);
      } else if (max > current) {
        // Counter exists but is behind Supabase max — update it.
        await databases.updateDocument({
          databaseId,
          collectionId: APPWRITE_COLLECTIONS.counters,
          documentId: docId,
          data: { value: max },
        });
        console.log(`  ${year}   ${String(max).padStart(13)}   ${String(max).padStart(13)}   updated (was ${current}, raised to ${max})`);
      } else {
        // Counter is already at or above Supabase max — safe, do not lower it.
        console.log(`  ${year}   ${String(max).padStart(13)}   ${String(current).padStart(13)}   skipped (counter ${current} >= Supabase max ${max})`);
      }
    }
  } else {
    // Dry run: just show what would be done.
    for (const [year, max] of Array.from(maxPerYear.entries()).sort(([a], [b]) => a - b)) {
      console.log(`  ${year}   ${String(max).padStart(13)}   ${String(max).padStart(13)}   [would seed to ${max}]`);
    }
  }

  console.log('');

  if (DRY_RUN) {
    console.log('[DRY RUN] No writes performed. Re-run without --dry-run to seed counters.');
  } else {
    console.log('Counter seeding complete.');
    console.log(
      'The next complaint inserted via allocateCorrelativo() will receive correlativo = max + 1.',
    );
  }
}

main().catch((err: unknown) => {
  console.error('seed-counter failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
