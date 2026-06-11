/**
 * Export all Supabase tables to JSON files under scripts/migration/data/.
 *
 * Run BEFORE import-appwrite.ts. The data/ directory is git-ignored and
 * contains potentially sensitive personal data (complaints) — never commit it.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/migration/export-supabase.ts
 *
 * Output files (one per table):
 *   scripts/migration/data/
 *     admin_users.json
 *     categories.json
 *     colors.json              (from product_colors table)
 *     flower_types.json
 *     products.json
 *     product_images.json
 *     product_color_assignments.json
 *     product_flower_type_assignments.json
 *     complaints.json
 *     summary.json             (row counts per table)
 */

import fs from 'node:fs';
import path from 'node:path';

import { getSupabaseClient } from './lib/supabase-client';

const DATA_DIR = path.join(import.meta.dirname, 'data');

interface ExportedTable {
  table: string;
  rows: unknown[];
}

interface Summary {
  exportedAt: string;
  tables: Record<string, number>;
}

async function fetchAll(table: string): Promise<unknown[]> {
  const supabase = getSupabaseClient();
  const rows: unknown[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch ${table} at offset ${from}: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

/** Writes rows to a JSON file and returns the count. */
function writeJson(filename: string, exported: ExportedTable): number {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(exported, null, 2), 'utf-8');
  return exported.rows.length;
}

async function main(): Promise<void> {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Tables to export and the output filename for each.
  // product_colors → colors (Appwrite collection id is `colors`).
  const tables: { supabaseTable: string; outputFile: string }[] = [
    { supabaseTable: 'admin_users', outputFile: 'admin_users.json' },
    { supabaseTable: 'categories', outputFile: 'categories.json' },
    { supabaseTable: 'product_colors', outputFile: 'colors.json' },
    { supabaseTable: 'flower_types', outputFile: 'flower_types.json' },
    { supabaseTable: 'products', outputFile: 'products.json' },
    { supabaseTable: 'product_images', outputFile: 'product_images.json' },
    { supabaseTable: 'product_color_assignments', outputFile: 'product_color_assignments.json' },
    { supabaseTable: 'product_flower_type_assignments', outputFile: 'product_flower_type_assignments.json' },
    { supabaseTable: 'complaints', outputFile: 'complaints.json' },
  ];

  const summary: Summary = {
    exportedAt: new Date().toISOString(),
    tables: {},
  };

  console.log(`Exporting Supabase data → ${DATA_DIR}`);
  console.log('');

  for (const { supabaseTable, outputFile } of tables) {
    process.stdout.write(`  ${supabaseTable.padEnd(40)} `);
    const rows = await fetchAll(supabaseTable);
    writeJson(outputFile, { table: supabaseTable, rows });
    summary.tables[supabaseTable] = rows.length;
    console.log(`${rows.length} rows`);
  }

  fs.writeFileSync(
    path.join(DATA_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8',
  );

  console.log('');
  console.log(`Export complete. Summary written to data/summary.json`);
}

main().catch((err: unknown) => {
  console.error('Export failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
