// Server-only: Appwrite categories repository.
//
// Returns rows shaped like Supabase's `categories` Row contract so the existing
// `mapCategoryRow` and admin consumers stay unchanged. The Supabase
// `category_price_summary` view (min active-product price per category) has no
// Appwrite equivalent, so `listCategoryPriceFrom` derives the same map in Node.
import { Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { CategoryDoc, ProductDoc } from '@/lib/appwrite/types';

import { getRepositoryContext, listAllDocuments } from './shared';

const C = APPWRITE_COLLECTIONS;

/** Row shape mirroring Supabase `categories` Row (snake_case, `id` not `$id`). */
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
