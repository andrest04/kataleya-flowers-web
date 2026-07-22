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

export interface ColorRepoRow {
  id: string;
  name: string;
  label: string;
  hex: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

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

export async function listColors(): Promise<ColorRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<ColorDoc>(databases, databaseId, C.colors, [
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toColorRow);
}

export async function listFlowerTypes(): Promise<FlowerTypeRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toFlowerTypeRow);
}

export interface TaxonomyUsage {
  product_id: string;
  product_name: string;
}

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

export async function deleteColorAppwrite(name: string): Promise<boolean> {
  const { databases, databaseId } = getRepositoryContext();

  const color = await findOneDocument<ColorDoc>(databases, databaseId, C.colors, [
    Query.equal('name', name),
  ]);
  if (!color) return false;

  await databases.deleteDocument({ databaseId, collectionId: C.colors, documentId: color.$id });
  return true;
}

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

export async function deleteFlowerTypeAppwrite(name: string): Promise<boolean> {
  const { databases, databaseId } = getRepositoryContext();

  const flowerType = await findOneDocument<FlowerTypeDoc>(databases, databaseId, C.flowerTypes, [
    Query.equal('name', name),
  ]);
  if (!flowerType) return false;

  await databases.deleteDocument({ databaseId, collectionId: C.flowerTypes, documentId: flowerType.$id });
  return true;
}

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
