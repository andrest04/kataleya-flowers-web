// Server-only: Appwrite taxonomy repository (colors + flower types).
//
// Mirrors the Supabase taxonomy queries (`getProductColors`, `getFlowerTypes`,
// and their admin/usage variants). Rows are shaped like the Supabase Row
// contracts so existing consumers stay unchanged.
import { Query } from 'node-appwrite';

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
  getRepositoryContext,
  listAllDocuments,
} from './shared';

const C = APPWRITE_COLLECTIONS;

/** Row shape mirroring Supabase `product_colors` Row. */
export interface ColorRepoRow {
  id: string;
  name: string;
  label: string;
  hex: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/** Row shape mirroring Supabase `flower_types` Row. */
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

  for (const chunk of chunkIds(productIds)) {
    const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
      Query.equal('$id', chunk),
      Query.select(['$id', 'name']),
    ]);
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
