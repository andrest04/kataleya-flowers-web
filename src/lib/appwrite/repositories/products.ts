// Server-only: Appwrite products repository.
//
// Returns rows shaped exactly like Supabase's `JoinedProductRow` (see
// `features/catalog/queries/mappers.ts`) so `mapProductRow` consumes them
// unchanged. Appwrite has no nested embeds, so related taxonomy and images are
// batch-fetched and composed in Node, mirroring the PostgREST nested-select.
import { Query } from 'node-appwrite';

import type { JoinedProductRow } from '@/features/catalog/queries/mappers';
import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type {
  CategoryDoc,
  ColorAssignmentDoc,
  ColorDoc,
  FlowerTypeAssignmentDoc,
  FlowerTypeDoc,
  ProductDoc,
  ProductImageDoc,
} from '@/lib/appwrite/types';

import {
  chunkIds,
  findOneDocument,
  getRepositoryContext,
  listAllDocuments,
} from './shared';

const C = APPWRITE_COLLECTIONS;

/** Maps a raw Appwrite product document to the Supabase `products` row shape. */
function toProductRow(doc: ProductDoc): Omit<
  JoinedProductRow,
  | 'product_color_assignments'
  | 'product_flower_type_assignments'
  | 'product_images'
> {
  return {
    id: doc.$id,
    category_id: doc.category_id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    price: doc.price,
    image_url: doc.image_url,
    images: doc.images,
    includes: doc.includes,
    colors: doc.colors,
    flower_types: doc.flower_types,
    occasion: doc.occasion,
    note: doc.note,
    price_variants: doc.price_variants,
    display_order: doc.display_order,
    is_active: doc.is_active,
    is_featured: doc.is_featured,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  } as Omit<
    JoinedProductRow,
    | 'product_color_assignments'
    | 'product_flower_type_assignments'
    | 'product_images'
  >;
}

interface RelatedData {
  colorAssignmentsByProduct: Map<string, { product_colors: { name: string } | null }[]>;
  flowerAssignmentsByProduct: Map<string, { flower_types: { name: string } | null }[]>;
  imagesByProduct: Map<
    string,
    {
      url: string;
      alt_text: string | null;
      is_primary: boolean;
      display_order: number;
    }[]
  >;
}

/**
 * Batch-fetches color assignments, flower-type assignments, and images for the
 * given product ids and indexes them by product id. Taxonomy assignment docs
 * store ids, so colors/flower types are resolved to their `name` to match the
 * nested-embed shape (`product_colors.name`, `flower_types.name`).
 */
async function fetchRelated(productIds: string[]): Promise<RelatedData> {
  const { databases, databaseId } = getRepositoryContext();

  const colorAssignmentsByProduct = new Map<
    string,
    { product_colors: { name: string } | null }[]
  >();
  const flowerAssignmentsByProduct = new Map<
    string,
    { flower_types: { name: string } | null }[]
  >();
  const imagesByProduct = new Map<
    string,
    {
      url: string;
      alt_text: string | null;
      is_primary: boolean;
      display_order: number;
    }[]
  >();

  if (productIds.length === 0) {
    return {
      colorAssignmentsByProduct,
      flowerAssignmentsByProduct,
      imagesByProduct,
    };
  }

  // Fetch the full taxonomy once and index id -> name (small, fixed sets).
  const [colors, flowerTypes] = await Promise.all([
    listAllDocuments<ColorDoc>(databases, databaseId, C.colors),
    listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes),
  ]);
  const colorNameById = new Map(colors.map((c) => [c.$id, c.name]));
  const flowerNameById = new Map(flowerTypes.map((f) => [f.$id, f.name]));

  // Batch-fetch assignments and images for all products (chunked in-lists).
  const idChunks = chunkIds(productIds);

  for (const chunk of idChunks) {
    const [colorAssignments, flowerAssignments, images] = await Promise.all([
      listAllDocuments<ColorAssignmentDoc>(databases, databaseId, C.colorAssignments, [
        Query.equal('product_id', chunk),
      ]),
      listAllDocuments<FlowerTypeAssignmentDoc>(
        databases,
        databaseId,
        C.flowerTypeAssignments,
        [Query.equal('product_id', chunk)],
      ),
      listAllDocuments<ProductImageDoc>(databases, databaseId, C.productImages, [
        Query.equal('product_id', chunk),
      ]),
    ]);

    for (const a of colorAssignments) {
      const name = colorNameById.get(a.color_id) ?? null;
      const list = colorAssignmentsByProduct.get(a.product_id) ?? [];
      list.push({ product_colors: name ? { name } : null });
      colorAssignmentsByProduct.set(a.product_id, list);
    }

    for (const a of flowerAssignments) {
      const name = flowerNameById.get(a.flower_type_id) ?? null;
      const list = flowerAssignmentsByProduct.get(a.product_id) ?? [];
      list.push({ flower_types: name ? { name } : null });
      flowerAssignmentsByProduct.set(a.product_id, list);
    }

    for (const img of images) {
      const list = imagesByProduct.get(img.product_id) ?? [];
      list.push({
        url: img.url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        display_order: img.display_order,
      });
      imagesByProduct.set(img.product_id, list);
    }
  }

  return {
    colorAssignmentsByProduct,
    flowerAssignmentsByProduct,
    imagesByProduct,
  };
}

/** Composes base product docs + related data into `JoinedProductRow` objects. */
function composeRows(products: ProductDoc[], related: RelatedData): JoinedProductRow[] {
  return products.map((doc) => ({
    ...toProductRow(doc),
    product_color_assignments:
      related.colorAssignmentsByProduct.get(doc.$id) ?? null,
    product_flower_type_assignments:
      related.flowerAssignmentsByProduct.get(doc.$id) ?? null,
    product_images: related.imagesByProduct.get(doc.$id) ?? null,
  }));
}

/**
 * Returns all active products under active categories, ordered by
 * `display_order` ascending — the Appwrite equivalent of `getProducts()`.
 * Active-category filtering is applied in Node (no DB inner join).
 */
export async function listActiveJoinedProducts(): Promise<JoinedProductRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const [products, categories] = await Promise.all([
    listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
      Query.equal('is_active', true),
      Query.orderAsc('display_order'),
    ]),
    listAllDocuments<CategoryDoc>(
      databases,
      databaseId,
      C.categories,
      [Query.equal('is_active', true), Query.select(['$id'])],
    ),
  ]);

  const activeCategoryIds = new Set(categories.map((c) => c.$id));
  const visible = products.filter((p) => activeCategoryIds.has(p.category_id));

  const related = await fetchRelated(visible.map((p) => p.$id));
  return composeRows(visible, related);
}

/**
 * Returns a single active product by slug as a `JoinedProductRow`, or null when
 * no active product matches — the Appwrite equivalent of `getProductBySlug()`.
 */
export async function findActiveJoinedProductBySlug(
  slug: string,
): Promise<JoinedProductRow | null> {
  const { databases, databaseId } = getRepositoryContext();

  const product = await findOneDocument<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('slug', slug),
    Query.equal('is_active', true),
  ]);
  if (!product) {
    return null;
  }

  const related = await fetchRelated([product.$id]);
  return composeRows([product], related)[0] ?? null;
}

/**
 * Returns active products for an active category slug, ordered by
 * `display_order` ascending — the Appwrite equivalent of
 * `getProductsByCategory()`. Returns `[]` when the category is missing/inactive.
 */
export async function listActiveJoinedProductsByCategorySlug(
  categorySlug: string,
): Promise<JoinedProductRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const category = await findOneDocument<CategoryDoc>(databases, databaseId, C.categories, [
    Query.equal('slug', categorySlug),
    Query.equal('is_active', true),
  ]);

  if (!category) {
    return [];
  }

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('category_id', category.$id),
    Query.equal('is_active', true),
    Query.orderAsc('display_order'),
  ]);

  const related = await fetchRelated(products.map((p) => p.$id));
  return composeRows(products, related);
}

/** Minimal product row for the sitemap (Appwrite equivalent of getSitemapProducts). */
export interface SitemapProductRow {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

/**
 * Returns slug/categorySlug/updatedAt for every active product under an active
 * category, newest first — the Appwrite equivalent of `getSitemapProducts()`.
 */
export async function listSitemapProducts(): Promise<SitemapProductRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const [products, categories] = await Promise.all([
    listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
      Query.equal('is_active', true),
      Query.orderDesc('$updatedAt'),
    ]),
    listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
      Query.equal('is_active', true),
    ]),
  ]);

  const categorySlugById = new Map(categories.map((c) => [c.$id, c.slug]));

  return products.flatMap((p): SitemapProductRow[] => {
    const categorySlug = categorySlugById.get(p.category_id);
    if (!categorySlug) {
      return [];
    }
    return [{ slug: p.slug, categorySlug, updatedAt: p.$updatedAt }];
  });
}
