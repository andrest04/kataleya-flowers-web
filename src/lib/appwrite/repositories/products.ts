// Server-only: Appwrite products repository.
//
// Returns rows shaped exactly like the `JoinedProductRow` contract (see
// `features/catalog/queries/mappers.ts`) so `mapProductRow` consumes them
// unchanged. Appwrite has no nested embeds, so related taxonomy and images are
// batch-fetched and composed in Node.
import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import type { JoinedProductRow } from '@/features/catalog/queries/mappers';
import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type {
  CategoryDoc,
  ColorAssignmentDoc,
  ColorDoc,
  FlowerTypeAssignmentDoc,
  FlowerTypeDoc,
  JsonValue,
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

/**
 * `price_variants` is persisted as a JSON string in Appwrite, so parse it back
 * to the array/object shape `mapProductRow` expects. A malformed or truncated
 * value degrades to `null` (no price table) instead of throwing and crashing
 * the product page.
 */
function parsePriceVariants(value: ProductDoc['price_variants']): JsonValue | null {
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value) as JsonValue;
  } catch {
    return null;
  }
}

/** Maps a raw Appwrite product document to the `products` row shape. */
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
    price_variants: parsePriceVariants(doc.price_variants),
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

/**
 * Admin row shape with richer taxonomy data for the admin edit form.
 * Mirrors `AdminProductRow` from `features/admin/queries/products.ts`.
 * product_images includes `id` so the admin form can key image rows.
 */
export type AdminProductAppwriteRow = Omit<JoinedProductRow, 'product_color_assignments' | 'product_flower_type_assignments' | 'product_images'> & {
  product_color_assignments:
    | { color_id: string; product_colors: { id: string; name: string; hex: string | null; label: string } | null }[]
    | null;
  product_flower_type_assignments:
    | { flower_type_id: string; flower_types: { id: string; name: string } | null }[]
    | null;
  product_images:
    | { id: string; url: string; alt_text: string | null; is_primary: boolean; display_order: number }[]
    | null;
};

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

// ─── Admin-only: richer taxonomy fetch (includes ids) ────────────────────────

/**
 * Batch-fetches color and flower-type assignments keyed by product id,
 * including the referenced taxonomy ids and doc data — for the admin edit form.
 */
async function fetchAdminRelated(productIds: string[]): Promise<{
  colorAssignmentsByProduct: Map<
    string,
    { color_id: string; product_colors: { id: string; name: string; hex: string | null; label: string } | null }[]
  >;
  flowerAssignmentsByProduct: Map<
    string,
    { flower_type_id: string; flower_types: { id: string; name: string } | null }[]
  >;
  imagesByProduct: Map<
    string,
    { id: string; url: string; alt_text: string | null; is_primary: boolean; display_order: number }[]
  >;
}> {
  const { databases, databaseId } = getRepositoryContext();

  const colorAssignmentsByProduct = new Map<
    string,
    { color_id: string; product_colors: { id: string; name: string; hex: string | null; label: string } | null }[]
  >();
  const flowerAssignmentsByProduct = new Map<
    string,
    { flower_type_id: string; flower_types: { id: string; name: string } | null }[]
  >();
  const imagesByProduct = new Map<
    string,
    { id: string; url: string; alt_text: string | null; is_primary: boolean; display_order: number }[]
  >();

  if (productIds.length === 0) {
    return { colorAssignmentsByProduct, flowerAssignmentsByProduct, imagesByProduct };
  }

  const [allColors, allFlowerTypes] = await Promise.all([
    listAllDocuments<ColorDoc>(databases, databaseId, C.colors),
    listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes),
  ]);
  const colorById = new Map(allColors.map((c) => [c.$id, c]));
  const flowerById = new Map(allFlowerTypes.map((f) => [f.$id, f]));

  for (const chunk of chunkIds(productIds)) {
    const [colorAssignments, flowerAssignments, images] = await Promise.all([
      listAllDocuments<ColorAssignmentDoc>(databases, databaseId, C.colorAssignments, [
        Query.equal('product_id', chunk),
      ]),
      listAllDocuments<FlowerTypeAssignmentDoc>(databases, databaseId, C.flowerTypeAssignments, [
        Query.equal('product_id', chunk),
      ]),
      listAllDocuments<ProductImageDoc>(databases, databaseId, C.productImages, [
        Query.equal('product_id', chunk),
        Query.orderAsc('display_order'),
      ]),
    ]);

    for (const a of colorAssignments) {
      const colorDoc = colorById.get(a.color_id);
      const list = colorAssignmentsByProduct.get(a.product_id) ?? [];
      list.push({
        color_id: a.color_id,
        product_colors: colorDoc
          ? { id: colorDoc.$id, name: colorDoc.name, hex: colorDoc.hex, label: colorDoc.label }
          : null,
      });
      colorAssignmentsByProduct.set(a.product_id, list);
    }

    for (const a of flowerAssignments) {
      const flowerDoc = flowerById.get(a.flower_type_id);
      const list = flowerAssignmentsByProduct.get(a.product_id) ?? [];
      list.push({
        flower_type_id: a.flower_type_id,
        flower_types: flowerDoc ? { id: flowerDoc.$id, name: flowerDoc.name } : null,
      });
      flowerAssignmentsByProduct.set(a.product_id, list);
    }

    for (const img of images) {
      const list = imagesByProduct.get(img.product_id) ?? [];
      list.push({
        id: img.$id,
        url: img.url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        display_order: img.display_order,
      });
      imagesByProduct.set(img.product_id, list);
    }
  }

  return { colorAssignmentsByProduct, flowerAssignmentsByProduct, imagesByProduct };
}

/**
 * Returns all products (active + inactive) ordered by `display_order` for the
 * admin product table — the Appwrite equivalent of `getAdminProducts()`.
 */
export async function listAdminProducts(): Promise<AdminProductAppwriteRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.orderAsc('display_order'),
  ]);

  const related = await fetchAdminRelated(products.map((p) => p.$id));

  return products.map((doc) => ({
    ...toProductRow(doc),
    product_color_assignments: related.colorAssignmentsByProduct.get(doc.$id) ?? null,
    product_flower_type_assignments: related.flowerAssignmentsByProduct.get(doc.$id) ?? null,
    product_images: related.imagesByProduct.get(doc.$id) ?? null,
  })) as AdminProductAppwriteRow[];
}

/**
 * Returns a single product by id with full taxonomy — the Appwrite equivalent
 * of `getAdminProductById()`. Returns null when not found.
 */
export async function findAdminProductById(
  id: string,
): Promise<AdminProductAppwriteRow | null> {
  const { databases, databaseId } = getRepositoryContext();

  try {
    const doc = await databases.getDocument<ProductDoc>({ databaseId, collectionId: C.products, documentId: id });
    const related = await fetchAdminRelated([doc.$id]);
    return {
      ...toProductRow(doc),
      product_color_assignments: related.colorAssignmentsByProduct.get(doc.$id) ?? null,
      product_flower_type_assignments: related.flowerAssignmentsByProduct.get(doc.$id) ?? null,
      product_images: related.imagesByProduct.get(doc.$id) ?? null,
    } as AdminProductAppwriteRow;
  } catch {
    return null;
  }
}

/** Scalar product fields for create/update. All normalized names (not ids). */
export interface ProductWritePayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  includes: string[];
  priceVariants: unknown;
  occasion: string | null;
  note: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

/**
 * Creates a product document and returns its new id.
 * The caller is responsible for creating taxonomy assignments and image rows
 * immediately after (via `syncProductTaxonomyAppwrite`).
 */
export async function createProductDocument(
  payload: ProductWritePayload,
): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();

  const priceVariantsStr =
    payload.priceVariants != null
      ? JSON.stringify(payload.priceVariants).slice(0, 4096)
      : null;

  const doc = await databases.createDocument<ProductDoc>({
    databaseId,
    collectionId: C.products,
    // UUID (not ID.unique()) so admin actions' `uuid` schema accepts the id for
    // later edit/delete/toggle — migrated rows keep their original UUIDs too.
    documentId: ID.custom(randomUUID()),
    data: {
      category_id: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      price: payload.price,
      image_url: payload.imageUrl,
      // denormalized caches maintained by syncProductTaxonomyAppwrite after create
      images: [],
      includes: payload.includes,
      colors: [],
      flower_types: [],
      occasion: payload.occasion,
      note: payload.note,
      price_variants: priceVariantsStr,
      display_order: payload.displayOrder,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
    },
  });

  return doc.$id;
}

/**
 * Updates scalar fields of an existing product document.
 * Taxonomy assignments and image rows are replaced by `syncProductTaxonomyAppwrite`.
 */
export async function updateProductDocument(
  id: string,
  payload: ProductWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();

  const priceVariantsStr =
    payload.priceVariants != null
      ? JSON.stringify(payload.priceVariants).slice(0, 4096)
      : null;

  await databases.updateDocument<ProductDoc>({
    databaseId,
    collectionId: C.products,
    documentId: id,
    data: {
      category_id: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      price: payload.price,
      image_url: payload.imageUrl,
      includes: payload.includes,
      occasion: payload.occasion,
      note: payload.note,
      price_variants: priceVariantsStr,
      display_order: payload.displayOrder,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
    },
  });
}

/**
 * Deletes a product document (junctions cascade-deletes via Appwrite
 * relationship cleanup are NOT automatic — caller must call
 * `deleteProductRelations` first to remove assignment/image docs).
 */
export async function deleteProductDocument(id: string): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({ databaseId, collectionId: C.products, documentId: id });
}

/**
 * Deletes all color assignments, flower-type assignments, and product_images
 * rows for a product. Call before `deleteProductDocument` or before re-syncing
 * taxonomy.
 */
export async function deleteProductRelations(productId: string): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();

  const [colorAssignments, flowerAssignments, images] = await Promise.all([
    listAllDocuments<ColorAssignmentDoc>(databases, databaseId, C.colorAssignments, [
      Query.equal('product_id', [productId]),
    ]),
    listAllDocuments<FlowerTypeAssignmentDoc>(databases, databaseId, C.flowerTypeAssignments, [
      Query.equal('product_id', [productId]),
    ]),
    listAllDocuments<ProductImageDoc>(databases, databaseId, C.productImages, [
      Query.equal('product_id', [productId]),
    ]),
  ]);

  await Promise.all([
    ...colorAssignments.map((a) =>
      databases.deleteDocument({ databaseId, collectionId: C.colorAssignments, documentId: a.$id }),
    ),
    ...flowerAssignments.map((a) =>
      databases.deleteDocument({ databaseId, collectionId: C.flowerTypeAssignments, documentId: a.$id }),
    ),
    ...images.map((img) =>
      databases.deleteDocument({ databaseId, collectionId: C.productImages, documentId: img.$id }),
    ),
  ]);
}

/** Returns all current product_images URLs for a product (for Cloudinary cleanup). */
export async function getProductImageUrls(productId: string): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<ProductImageDoc>(databases, databaseId, C.productImages, [
    Query.equal('product_id', [productId]),
  ]);
  return docs.map((d) => d.url);
}

interface TaxonomySyncInput {
  productId: string;
  productName: string;
  colorNames: string[];
  flowerTypeNames: string[];
  imageUrl: string;
  galleryImages: string[];
}

/**
 * Replaces taxonomy assignments and product_images for a product.
 *
 * Algorithm:
 *   1. Delete all existing assignments and image rows
 *   2. Resolve color names → ids (upsert new colors first if needed)
 *   3. Resolve flower-type names → ids
 *   4. Insert new color assignments, flower-type assignments, and image rows
 *   5. Update denormalized cache arrays on the product document
 *
 * Returns an error descriptor on failure; null on success.
 */
export async function syncProductTaxonomyAppwrite(
  input: TaxonomySyncInput,
): Promise<{ code: string; message: string } | null> {
  const { databases, databaseId } = getRepositoryContext();
  const { productId, productName, colorNames, flowerTypeNames, imageUrl, galleryImages } = input;

  try {
    // 1. Delete existing relations
    await deleteProductRelations(productId);

    // 2. Resolve colors (all existing colors indexed by name)
    const allColors = await listAllDocuments<ColorDoc>(databases, databaseId, C.colors);
    const colorByName = new Map(allColors.map((c) => [c.name, c.$id]));
    const colorIds = colorNames.map((n) => colorByName.get(n)).filter((id): id is string => id !== undefined);

    // 3. Resolve flower types
    const allFlowers = await listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes);
    const flowerByName = new Map(allFlowers.map((f) => [f.name, f.$id]));
    const flowerIds = flowerTypeNames.map((n) => flowerByName.get(n)).filter((id): id is string => id !== undefined);

    // 4. Build image list (primary first, deduped)
    const imageDocs: { url: string; altText: string; isPrimary: boolean; displayOrder: number }[] = [];
    if (imageUrl) {
      imageDocs.push({ url: imageUrl, altText: productName, isPrimary: true, displayOrder: 0 });
    }
    galleryImages.forEach((url, i) => {
      if (url !== imageUrl) {
        imageDocs.push({ url, altText: productName, isPrimary: false, displayOrder: i + 1 });
      }
    });

    // 5. Insert new relations in parallel batches
    await Promise.all([
      ...colorIds.map((colorId) =>
        databases.createDocument({ databaseId, collectionId: C.colorAssignments, documentId: ID.unique(), data: { product_id: productId, color_id: colorId } }),
      ),
      ...flowerIds.map((flowerTypeId) =>
        databases.createDocument({ databaseId, collectionId: C.flowerTypeAssignments, documentId: ID.unique(), data: { product_id: productId, flower_type_id: flowerTypeId } }),
      ),
      ...imageDocs.map((img) =>
        databases.createDocument({ databaseId, collectionId: C.productImages, documentId: ID.unique(), data: { product_id: productId, url: img.url, alt_text: img.altText, is_primary: img.isPrimary, display_order: img.displayOrder } }),
      ),
    ]);

    // 6. Update denormalized cache arrays on the product doc
    await databases.updateDocument<ProductDoc>({
      databaseId,
      collectionId: C.products,
      documentId: productId,
      data: {
        images: imageDocs.map((img) => img.url),
        colors: colorNames,
        flower_types: flowerTypeNames,
      },
    });

    return null;
  } catch (err) {
    return { code: 'INTERNAL', message: `syncProductTaxonomyAppwrite failed: ${String(err)}` };
  }
}

/**
 * Updates only the `is_active` flag of a product — the Appwrite equivalent of
 * toggling product status.
 */
export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<ProductDoc>({
    databaseId,
    collectionId: C.products,
    documentId: id,
    data: { is_active: isActive },
  });
}

/**
 * Updates `display_order` for a list of product ids in the given order.
 * The Appwrite equivalent of the `reorder_products` RPC.
 */
export async function reorderProductDocuments(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await Promise.all(
    orderedIds.map((id, index) =>
      databases.updateDocument<ProductDoc>({
        databaseId,
        collectionId: C.products,
        documentId: id,
        data: { display_order: index + 1 },
      }),
    ),
  );
}

/**
 * Returns the next display_order value for a new product
 * (max existing + 1, or 1 if no products exist yet).
 */
export async function getNextProductOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<ProductDoc>({
    databaseId,
    collectionId: C.products,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  const maxOrder = page.documents[0]?.display_order ?? 0;
  return maxOrder + 1;
}

/**
 * Returns the category slug for a product id (used for revalidation).
 * Resolves product → category_id → category slug in two lookups.
 */
export async function getProductCategorySlug(
  productId: string,
): Promise<{ categoryId: string; categorySlug: string | null } | null> {
  const { databases, databaseId } = getRepositoryContext();

  try {
    const productDoc = await databases.getDocument<ProductDoc>({ databaseId, collectionId: C.products, documentId: productId });
    const categoryDoc = await databases.getDocument<CategoryDoc>({ databaseId, collectionId: C.categories, documentId: productDoc.category_id });
    return { categoryId: productDoc.category_id, categorySlug: categoryDoc.slug };
  } catch {
    return null;
  }
}

/**
 * Returns category slug by category id (used for revalidation in create/update).
 */
export async function getCategorySlugById(categoryId: string): Promise<string | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<CategoryDoc>({ databaseId, collectionId: C.categories, documentId: categoryId });
    return doc.slug;
  } catch {
    return null;
  }
}

/**
 * Returns category id → slug map for a set of product ids.
 * Used in reorderProducts to revalidate affected category pages.
 */
export async function getCategorySlugsForProducts(
  productIds: string[],
): Promise<Map<string, string>> {
  const { databases, databaseId } = getRepositoryContext();

  const productDocs = await Promise.all(
    productIds.map((id) =>
      databases.getDocument<ProductDoc>({ databaseId, collectionId: C.products, documentId: id }).catch(() => null),
    ),
  );

  const categoryIds = [
    ...new Set(
      productDocs.flatMap((doc) => (doc ? [doc.category_id] : [])),
    ),
  ];

  if (categoryIds.length === 0) {
    return new Map();
  }

  const slugMap = new Map<string, string>();
  const chunks = chunkIds(categoryIds);
  for (const chunk of chunks) {
    const categoryDocs = await listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
      Query.equal('$id', chunk),
      Query.select(['$id', 'slug']),
    ]);
    for (const cat of categoryDocs) {
      slugMap.set(cat.$id, cat.slug);
    }
  }

  return slugMap;
}
