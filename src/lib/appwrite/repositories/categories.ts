import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { CategoryDoc, ProductDoc, ProductImageDoc } from '@/lib/appwrite/types';

import { deleteProductRelations } from './products';
import { getRepositoryContext, listAllDocuments } from './shared';

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

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('category_id', [categoryId]),
  ]);

  const perProductImageUrls = await Promise.all(
    products.map(async (product) => {
      const productImageDocs = await listAllDocuments<ProductImageDoc>(
        databases,
        databaseId,
        C.productImages,
        [Query.equal('product_id', [product.$id])],
      );

      await deleteProductRelations(product.$id);

      await databases.deleteDocument({ databaseId, collectionId: C.products, documentId: product.$id });

      return productImageDocs.map((img) => img.url);
    }),
  );
  const imageUrls: string[] = perProductImageUrls.flat();

  await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: categoryId });

  return imageUrls;
}

export async function deleteCategoryReassignAppwrite(
  categoryId: string,
  reassignToId: string,
): Promise<string | null> {
  const { databases, databaseId } = getRepositoryContext();

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('category_id', [categoryId]),
    Query.select(['$id']),
  ]);

  await Promise.all(
    products.map((p) =>
      databases.updateDocument<ProductDoc>({
        databaseId,
        collectionId: C.products,
        documentId: p.$id,
        data: { category_id: reassignToId },
      }),
    ),
  );

  const catDoc = await findCategoryById(categoryId);
  await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: categoryId });

  return catDoc?.image_url ?? null;
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

export async function setCategoryFeatured(id: string, isFeatured: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: id,
    data: { is_featured: isFeatured },
  });
}

export async function reorderCategoryDocuments(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await Promise.all(
    orderedIds.map((id, index) =>
      databases.updateDocument<CategoryDoc>({
        databaseId,
        collectionId: C.categories,
        documentId: id,
        data: { display_order: index + 1 },
      }),
    ),
  );
}

export async function listAllCategorySlugs(): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.select(['slug']),
  ]);
  return docs.flatMap((d) => (d.slug ? [d.slug] : []));
}
