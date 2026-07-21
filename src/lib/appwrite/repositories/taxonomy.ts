// Server-only: Appwrite taxonomy repository (colors + flower types).
//
// Taxonomy queries (`getProductColors`, `getFlowerTypes`, and their admin/usage
// variants). Rows are shaped to match the existing row contracts so consumers
// stay unchanged.
import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type {
  ColorAssignmentDoc,
  ColorDoc,
  FlowerTypeAssignmentDoc,
  FlowerTypeDoc,
  ProductDoc,
} from '@/lib/appwrite/types';

import {
  chunkIds,
  findOneDocument,
  getRepositoryContext,
  listAllDocuments,
} from './shared';

const C = APPWRITE_COLLECTIONS;

/** Row shape for `product_colors` (snake_case, `id` not `$id`). */
export interface ColorRepoRow {
  id: string;
  name: string;
  label: string;
  hex: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/** Row shape for `flower_types` (snake_case, `id` not `$id`). */
export interface FlowerTypeRepoRow {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

function toColorRow(doc: ColorDoc): ColorRepoRow {
  return {
    id: doc.$id,
    name: doc.name,
    label: doc.label,
    hex: doc.hex,
    display_order: doc.display_order,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };
}

function toFlowerTypeRow(doc: FlowerTypeDoc): FlowerTypeRepoRow {
  return {
    id: doc.$id,
    name: doc.name,
    display_order: doc.display_order,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };
}

/**
 * Returns colors ordered by `display_order` ascending — the Appwrite equivalent
 * of both the public (`name, label, hex`) and admin (`*`) color queries.
 */
export async function listColors(): Promise<ColorRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<ColorDoc>(databases, databaseId, C.colors, [
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toColorRow);
}

/**
 * Returns flower types ordered by `display_order` ascending — the Appwrite
 * equivalent of the public and admin flower-type queries.
 */
export async function listFlowerTypes(): Promise<FlowerTypeRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toFlowerTypeRow);
}

/** Product reference for a taxonomy usage lookup. */
export interface TaxonomyUsage {
  product_id: string;
  product_name: string;
}

/** Resolves product names for a set of product ids (chunked in-lists). */
async function resolveProductNames(
  productIds: string[],
): Promise<TaxonomyUsage[]> {
  if (productIds.length === 0) {
    return [];
  }

  const { databases, databaseId } = getRepositoryContext();
  const usage: TaxonomyUsage[] = [];

  const chunkResults = await Promise.all(
    chunkIds(productIds).map((chunk) =>
      listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
        Query.equal('$id', chunk),
        Query.select(['$id', 'name']),
      ]),
    ),
  );
  for (const products of chunkResults) {
    for (const product of products) {
      usage.push({ product_id: product.$id, product_name: product.name });
    }
  }

  return usage;
}

/**
 * Returns the products using a color (by name) — the Appwrite equivalent of
 * `getProductColorUsage()`. Resolves the color name to its id, then the
 * assignments, then product names.
 */
export async function getColorUsage(name: string): Promise<TaxonomyUsage[]> {
  const { databases, databaseId } = getRepositoryContext();

  const colors = await listAllDocuments<ColorDoc>(databases, databaseId, C.colors, [
    Query.equal('name', name),
    Query.limit(1),
  ]);
  const color = colors[0];
  if (!color) {
    return [];
  }

  const assignments = await listAllDocuments<ColorAssignmentDoc>(
    databases,
    databaseId,
    C.colorAssignments,
    [Query.equal('color_id', color.$id)],
  );

  return resolveProductNames(assignments.map((a) => a.product_id));
}

/**
 * Returns the products using a flower type (by name) — the Appwrite equivalent
 * of `getFlowerTypeUsage()`.
 */
export async function getFlowerTypeUsage(
  name: string,
): Promise<TaxonomyUsage[]> {
  const { databases, databaseId } = getRepositoryContext();

  const flowerTypes = await listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.equal('name', name),
    Query.limit(1),
  ]);
  const flowerType = flowerTypes[0];
  if (!flowerType) {
    return [];
  }

  const assignments = await listAllDocuments<FlowerTypeAssignmentDoc>(
    databases,
    databaseId,
    C.flowerTypeAssignments,
    [Query.equal('flower_type_id', flowerType.$id)],
  );

  return resolveProductNames(assignments.map((a) => a.product_id));
}

// ─── Admin write operations ───────────────────────────────────────────────────

/**
 * Returns the next display_order for a new color or flower type.
 */
async function getNextTaxonomyOrder(
  collectionId: string,
): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments({
    databaseId,
    collectionId,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  const maxOrder = (page.documents[0] as { display_order?: number } | undefined)?.display_order ?? 0;
  return maxOrder + 1;
}

/**
 * Upserts colors by name (case-insensitive, lowercased). New colors are inserted;
 * existing ones (matched by name) are skipped — idempotent upsert behaviour.
 * Returns the normalized names so callers can resolve them to ids.
 */
export async function ensureColorsAppwrite(
  colors: { name: string; hex: string }[],
): Promise<void> {
  if (colors.length === 0) return;
  const { databases, databaseId } = getRepositoryContext();

  const existing = await listAllDocuments<ColorDoc>(databases, databaseId, C.colors);
  const existingNames = new Set(existing.map((c) => c.name));

  const newColors = colors.filter((c) => !existingNames.has(c.name.toLowerCase().trim()));
  if (newColors.length === 0) return;

  const nextOrder = await getNextTaxonomyOrder(C.colors);

  await Promise.all(
    newColors.map((c, i) =>
      databases.createDocument<ColorDoc>({
        databaseId,
        collectionId: C.colors,
        documentId: ID.unique(),
        data: {
          name: c.name.toLowerCase().trim(),
          label: c.name.charAt(0).toUpperCase() + c.name.slice(1).toLowerCase().trim(),
          hex: c.hex || null,
          display_order: nextOrder + i,
        },
      }),
    ),
  );
}

/**
 * Upserts flower types by name. New entries are inserted; existing ones skipped.
 */
export async function ensureFlowerTypesAppwrite(names: string[]): Promise<void> {
  if (names.length === 0) return;
  const { databases, databaseId } = getRepositoryContext();

  const existing = await listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes);
  const existingNames = new Set(existing.map((f) => f.name));

  const newNames = names.filter((n) => !existingNames.has(n.toLowerCase().trim()));
  if (newNames.length === 0) return;

  const nextOrder = await getNextTaxonomyOrder(C.flowerTypes);

  await Promise.all(
    newNames.map((n, i) =>
      databases.createDocument<FlowerTypeDoc>({
        databaseId,
        collectionId: C.flowerTypes,
        documentId: ID.unique(),
        data: {
          name: n.toLowerCase().trim(),
          display_order: nextOrder + i,
        },
      }),
    ),
  );
}

/**
 * Deletes a color by name. Returns true if deleted, false if not found.
 * Throws if the color is still referenced (no ON DELETE RESTRICT in Appwrite —
 * callers MUST check usage before deleting to emulate FK-RESTRICT).
 */
export async function deleteColorAppwrite(name: string): Promise<boolean> {
  const { databases, databaseId } = getRepositoryContext();

  const color = await findOneDocument<ColorDoc>(databases, databaseId, C.colors, [
    Query.equal('name', name),
  ]);
  if (!color) return false;

  await databases.deleteDocument({ databaseId, collectionId: C.colors, documentId: color.$id });
  return true;
}

/**
 * Renames a color (updates the `name` field). Returns false if the color is not
 * found. Uniqueness is enforced by checking existing names before writing.
 *
 * Returns 'duplicate' when the new name already exists, 'not_found' when the old
 * name does not exist, or null on success.
 */
export async function renameColorAppwrite(
  oldName: string,
  newName: string,
): Promise<'duplicate' | 'not_found' | null> {
  const { databases, databaseId } = getRepositoryContext();
  const normalized = newName.toLowerCase().trim();

  const color = await findOneDocument<ColorDoc>(databases, databaseId, C.colors, [
    Query.equal('name', oldName),
  ]);
  if (!color) return 'not_found';

  // Check for duplicate
  const duplicate = await findOneDocument<ColorDoc>(databases, databaseId, C.colors, [
    Query.equal('name', normalized),
  ]);
  if (duplicate) return 'duplicate';

  await databases.updateDocument<ColorDoc>({
    databaseId,
    collectionId: C.colors,
    documentId: color.$id,
    data: { name: normalized },
  });

  return null;
}

/**
 * Deletes a flower type by name. Returns true if deleted, false if not found.
 */
export async function deleteFlowerTypeAppwrite(name: string): Promise<boolean> {
  const { databases, databaseId } = getRepositoryContext();

  const flowerType = await findOneDocument<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.equal('name', name),
  ]);
  if (!flowerType) return false;

  await databases.deleteDocument({ databaseId, collectionId: C.flowerTypes, documentId: flowerType.$id });
  return true;
}

/**
 * Renames a flower type. Returns 'duplicate' | 'not_found' | null (success).
 */
export async function renameFlowerTypeAppwrite(
  oldName: string,
  newName: string,
): Promise<'duplicate' | 'not_found' | null> {
  const { databases, databaseId } = getRepositoryContext();
  const normalized = newName.toLowerCase().trim();

  const flowerType = await findOneDocument<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.equal('name', oldName),
  ]);
  if (!flowerType) return 'not_found';

  const duplicate = await findOneDocument<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.equal('name', normalized),
  ]);
  if (duplicate) return 'duplicate';

  await databases.updateDocument<FlowerTypeDoc>({
    databaseId,
    collectionId: C.flowerTypes,
    documentId: flowerType.$id,
    data: { name: normalized },
  });

  return null;
}
