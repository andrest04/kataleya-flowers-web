// Server-only: Appwrite categories repository.
//
// Returns rows shaped like the `categories` row contract so the existing
// `mapCategoryRow` and admin consumers stay unchanged. The
// `category_price_summary` view (min active-product price per category) has no
// Appwrite equivalent, so `listCategoryPriceFrom` derives the same map in Node.
import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { CategoryDoc, ProductDoc, ProductImageDoc } from '@/lib/appwrite/types';

import { deleteProductRelations } from './products';
import { getRepositoryContext, listAllDocuments } from './shared';

const C = APPWRITE_COLLECTIONS;

/** Row shape for `categories` (snake_case, `id` not `$id`). */
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

/**
 * Returns active categories ordered by `display_order` ascending — the Appwrite
 * equivalent of the public `getCategories()` query (price-from computed
 * separately via `listCategoryPriceFrom`).
 */
export async function listActiveCategories(): Promise<CategoryRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.equal('is_active', true),
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toCategoryRow);
}

/**
 * Returns all categories (active + inactive) ordered by `display_order` — the
 * Appwrite equivalent of admin `getAdminCategories()`.
 */
export async function listAllCategories(): Promise<CategoryRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.orderAsc('display_order'),
  ]);

  return docs.map(toCategoryRow);
}

/** Returns a single category by id, or null — admin `getAdminCategoryById()`. */
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

/**
 * Derives the `category_price_summary` view: minimum price among each
 * category's active products. Returns a `Map<categoryId, priceFrom>`; absent
 * keys mean the category has no active products (matches the view's null).
 */
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

// ─── Admin write operations ───────────────────────────────────────────────────

/** Write payload for create/update category. */
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

/**
 * Returns the next display_order for a new category
 * (max existing + 1, or 1 if no categories exist yet).
 */
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

/**
 * Creates a category document. Returns the new document id.
 */
export async function createCategoryDocument(
  payload: CategoryWritePayload,
): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    // UUID (not ID.unique()) so admin actions' `uuid` schema accepts the id for
    // later edit/delete/toggle — migrated rows keep their original UUIDs too.
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

/**
 * Updates an existing category document.
 */
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

/**
 * Deletes a category document. The caller handles product reassignment or
 * cascade delete BEFORE calling this.
 */
export async function deleteCategoryDocument(id: string): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: id });
}

/**
 * Returns the count of products in a category (for the delete confirmation UI).
 */
export async function countProductsInCategory(categoryId: string): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('category_id', [categoryId]),
    Query.select(['$id']),
  ]);
  return products.length;
}

/**
 * Cascades a category delete: fetches all product image URLs, deletes all
 * product_images rows, deletes all product documents, then deletes the category.
 * Returns the list of Cloudinary URLs (primary + gallery) for caller cleanup.
 */
export async function deleteCategoryCascadeAppwrite(
  categoryId: string,
): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('category_id', [categoryId]),
  ]);

  // Collect image URLs before deletion (for Cloudinary cleanup by caller).
  // deleteProductRelations handles colorAssignments + flowerTypeAssignments + productImages.
  const imageUrls: string[] = [];

  for (const product of products) {
    // Fetch image URLs before deleting relations (productImages rows are removed inside deleteProductRelations)
    const productImageDocs = await listAllDocuments<ProductImageDoc>(
      databases,
      databaseId,
      C.productImages,
      [Query.equal('product_id', [product.$id])],
    );
    imageUrls.push(...productImageDocs.map((img) => img.url));

    // Delete color assignments, flower-type assignments, and product_images rows
    await deleteProductRelations(product.$id);

    // Delete the product document
    await databases.deleteDocument({ databaseId, collectionId: C.products, documentId: product.$id });
  }

  // Delete the category itself
  await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: categoryId });

  return imageUrls;
}

/**
 * Reassigns all products of `categoryId` to `reassignToId`, then deletes the
 * category. Returns the category's image URL (for Cloudinary cleanup).
 */
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

  // Fetch the category image before deleting
  const catDoc = await findCategoryById(categoryId);
  await databases.deleteDocument({ databaseId, collectionId: C.categories, documentId: categoryId });

  return catDoc?.image_url ?? null;
}

/**
 * Updates only the `is_active` flag of a category.
 */
export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: id,
    data: { is_active: isActive },
  });
}

/**
 * Updates only the `is_featured` flag of a category.
 */
export async function setCategoryFeatured(id: string, isFeatured: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<CategoryDoc>({
    databaseId,
    collectionId: C.categories,
    documentId: id,
    data: { is_featured: isFeatured },
  });
}

/**
 * Updates `display_order` for a list of category ids in the given order.
 * The Appwrite equivalent of the `reorder_categories` RPC.
 */
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

/**
 * Returns all category slugs (used for bulk revalidation after reorder/delete).
 */
export async function listAllCategorySlugs(): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
    Query.select(['slug']),
  ]);
  return docs.map((d) => d.slug).filter(Boolean);
}
