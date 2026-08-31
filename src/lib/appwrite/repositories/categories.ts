import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type {
  CategoryDoc,
  ColorAssignmentDoc,
  FlowerTypeAssignmentDoc,
  ProductDoc,
  ProductImageDoc,
} from '@/lib/appwrite/types';

import {
  deleteKnownProductRelations,
  listAllDocumentsInTransaction,
} from './products';
import {
  chunkIds,
  getRepositoryContext,
  listAllDocuments,
  withAppwriteTransaction,
} from './shared';

const C = APPWRITE_COLLECTIONS;

export interface CategoryRepoRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  occasion: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

function toCategoryRow(doc: CategoryDoc): CategoryRepoRow {
  return {
    id: doc.$id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    image_url: doc.image_url,
    occasion: doc.occasion,
    display_order: doc.display_order,
    is_active: doc.is_active,
    is_featured: doc.is_featured,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };
}

export async function listActiveCategories(): Promise<CategoryRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.equal('is_active', true),
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toCategoryRow);
}

export async function listAllCategories(): Promise<CategoryRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toCategoryRow);
}

export async function findCategoryById(
  id: string,
): Promise<CategoryRepoRow | null> {
  const { databases, databaseId } = getRepositoryContext();

  try {
    const doc = await databases.getDocument<CategoryDoc>({
      databaseId,
      collectionId: C.categories,
      documentId: id,
    });
    return toCategoryRow(doc);
  } catch {
    return null;
  }
}

export async function listCategoryPriceFrom(): Promise<Map<string, number>> {
  const { databases, databaseId } = getRepositoryContext();

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('is_active', true),
    Query.select(['category_id', 'price']),
  ]);

  const priceFromByCategory = new Map<string, number>();
  for (const product of products) {
    const current = priceFromByCategory.get(product.category_id);
    if (current === undefined || product.price < current) {
      priceFromByCategory.set(product.category_id, product.price);
    }
  }

  return priceFromByCategory;
}

export interface CategoryWritePayload {
  name: string;
  slug: string;
  description: string;
  occasion: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

export async function getNextCategoryOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  const maxOrder = page.documents[0]?.display_order ?? 0;
  return maxOrder + 1;
}

export async function createCategoryDocument(
  payload: CategoryWritePayload,
): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: ID.custom(randomUUID()),
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      occasion: payload.occasion,
      image_url: payload.imageUrl,
      display_order: payload.displayOrder,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
    },
  });
  return doc.$id;
}

export async function updateCategoryDocument(
  id: string,
  payload: CategoryWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: id,
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      occasion: payload.occasion,
      image_url: payload.imageUrl,
      display_order: payload.displayOrder,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
    },
  });
}

export async function countProductsInCategory(categoryId: string): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('category_id', [categoryId]),
    Query.select(['$id']),
  ]);
  return products.length;
}

export async function deleteCategoryCascadeAppwrite(
  categoryId: string,
): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();

  return withAppwriteTransaction(async (transactionId) => {
    const products = await listAllDocumentsInTransaction<ProductDoc>(
      databases,
      databaseId,
      C.products,
      transactionId,
      [Query.equal('category_id', [categoryId])],
    );
    const relationIds = {
      colorAssignmentIds: [] as string[],
      flowerTypeAssignmentIds: [] as string[],
      imageIds: [] as string[],
    };
    const imageUrls: string[] = [];

    for (const productIdChunk of chunkIds(products.map((product) => product.$id))) {
      const [colorAssignments, flowerTypeAssignments, imageDocs] = await Promise.all([
        listAllDocumentsInTransaction<ColorAssignmentDoc>(
          databases,
          databaseId,
          C.colorAssignments,
          transactionId,
          [Query.equal('product_id', productIdChunk)],
        ),
        listAllDocumentsInTransaction<FlowerTypeAssignmentDoc>(
          databases,
          databaseId,
          C.flowerTypeAssignments,
          transactionId,
          [Query.equal('product_id', productIdChunk)],
        ),
        listAllDocumentsInTransaction<ProductImageDoc>(
          databases,
          databaseId,
          C.productImages,
          transactionId,
          [Query.equal('product_id', productIdChunk)],
        ),
      ]);

      relationIds.colorAssignmentIds.push(...colorAssignments.map((assignment) => assignment.$id));
      relationIds.flowerTypeAssignmentIds.push(...flowerTypeAssignments.map((assignment) => assignment.$id));
      relationIds.imageIds.push(...imageDocs.map((image) => image.$id));
      imageUrls.push(...imageDocs.map((image) => image.url));
    }

    await deleteKnownProductRelations(relationIds, transactionId);
    await Promise.all(
      products.map((product) =>
        databases.deleteDocument({
          databaseId,
          collectionId: C.products,
          documentId: product.$id,
          transactionId,
        }),
      ),
    );
    await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: categoryId, transactionId });
    return imageUrls;
  });
}

export async function deleteCategoryReassignAppwrite(
  categoryId: string,
  reassignToId: string,
): Promise<string | null> {
  const { databases, databaseId } = getRepositoryContext();

  return withAppwriteTransaction(async (transactionId) => {
    const [products, catDoc] = await Promise.all([
      listAllDocumentsInTransaction<ProductDoc>(
        databases,
        databaseId,
        C.products,
        transactionId,
        [Query.equal('category_id', [categoryId]), Query.select(['$id'])],
      ),
      databases.getDocument<CategoryDoc>({
        databaseId,
        collectionId: C.categories,
        documentId: categoryId,
        transactionId,
      }),
    ]);

    await Promise.all(
      products.map((product) =>
        databases.updateDocument<ProductDoc>({
          databaseId,
          collectionId: C.products,
          documentId: product.$id,
          transactionId,
          data: { category_id: reassignToId },
        }),
      ),
    );
    await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: categoryId, transactionId });
    return catDoc.image_url;
  });
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: id,
    data: { is_active: isActive },
  });
}

export async function reorderCategoriesAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.equal('$id', orderedIds),
    Query.select(['$id', 'display_order']),
  ]);
  const slots = documents.map((document) => document.display_order).sort((a, b) => a - b);
  const presentIds = orderedIds.filter((id) => documents.some((document) => document.$id === id));

  if (slots.length !== presentIds.length) return;

  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({
      transactionId,
      operations: presentIds.map((documentId, index) => ({
        action: 'update',
        databaseId,
        collectionId: C.categories,
        documentId,
        data: { display_order: slots[index] },
      })),
    }),
  );
}

export async function setCategoryFeatured(id: string, isFeatured: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: id,
    data: { is_featured: isFeatured },
  });
}

export async function listAllCategorySlugs(): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.select(['slug']),
  ]);
  return docs.flatMap((d) => (d.slug ? [d.slug] : []));
}
