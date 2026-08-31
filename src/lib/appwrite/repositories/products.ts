import { randomUUID } from 'node:crypto';

import { ID, type Models, Query } from 'node-appwrite';

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
import { matchesSearchText } from '@/lib/searchText';

import {
  APPWRITE_PAGE_SIZE,
  chunkIds,
  findOneDocument,
  getRepositoryContext,
  listAllDocuments,
  withAppwriteTransaction,
} from './shared';

const C = APPWRITE_COLLECTIONS;

export async function listAllDocumentsInTransaction<Doc extends Models.Document>(
  databases: ReturnType<typeof getRepositoryContext>['databases'],
  databaseId: string,
  collectionId: string,
  transactionId: string,
  queries: string[] = [],
): Promise<Doc[]> {
  const all: Doc[] = [];
  let cursor: string | null = null;

  for (;;) {
    const pageQueries = [...queries, Query.limit(APPWRITE_PAGE_SIZE)];
    if (cursor) {
      pageQueries.push(Query.cursorAfter(cursor));
    }

    const page = await databases.listDocuments<Doc>({
      databaseId,
      collectionId,
      queries: pageQueries,
      transactionId,
    });
    all.push(...page.documents);

    if (page.documents.length < APPWRITE_PAGE_SIZE) {
      return all;
    }
    cursor = page.documents[page.documents.length - 1].$id;
  }
}

const APPWRITE_READ_CONCURRENCY = 4;

async function mapInBatches<Input, Output>(
  inputs: Input[],
  map: (input: Input) => Promise<Output>,
): Promise<Output[]> {
  if (inputs.length === 0) return [];

  const batch = inputs.slice(0, APPWRITE_READ_CONCURRENCY);
  const remaining = inputs.slice(APPWRITE_READ_CONCURRENCY);
  const results = await Promise.all(batch.map(map));

  return remaining.length === 0
    ? results
    : [...results, ...(await mapInBatches(remaining, map))];
}

async function listProductImagesForProducts(
  databases: ReturnType<typeof getRepositoryContext>['databases'],
  databaseId: string,
  productIds: string[],
): Promise<ProductImageDoc[]> {
  const imageDocumentBatches = await mapInBatches(
    chunkIds(productIds),
    (productIdChunk) =>
      listAllDocuments<ProductImageDoc>(
        databases,
        databaseId,
        C.productImages,
        [
          Query.equal('product_id', productIdChunk),
          Query.select(['$id', 'product_id']),
        ],
      ),
  );

  return imageDocumentBatches.flat();
}

function parsePriceVariants(value: ProductDoc['price_variants']): JsonValue | null {
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value) as JsonValue;
  } catch {
    return null;
  }
}

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

  const [colors, flowerTypes] = await Promise.all([
    listAllDocuments<ColorDoc>(databases, databaseId, C.colors),
    listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes),
  ]);
  const colorNameById = new Map(colors.map((c) => [c.$id, c.name]));
  const flowerNameById = new Map(flowerTypes.map((f) => [f.$id, f.name]));

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

export interface SitemapProductRow {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

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

export interface AdminProductListRow {
  id: string;
  category_id: string;
  display_order: number;
  image_url: string;
  is_active: boolean;
  name: string;
  price: number;
  slug: string;
}

export interface AdminProductListPage {
  items: AdminProductListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminProductPageInput {
  page: number;
  pageSize: number;
  categoryId?: string;
  search?: string;
  status?: 'active' | 'inactive';
  gallery?: 'at-most-one-image';
}

const ADMIN_PRODUCT_LIST_FIELDS = [
  '$id',
  'category_id',
  'display_order',
  'image_url',
  'is_active',
  'name',
  'price',
  'slug',
];

function toAdminProductListRow(doc: ProductDoc): AdminProductListRow {
  return {
    id: doc.$id,
    category_id: doc.category_id,
    display_order: doc.display_order,
    image_url: doc.image_url,
    is_active: doc.is_active,
    name: doc.name,
    price: doc.price,
    slug: doc.slug,
  };
}

export async function listAdminProductCategoryCounts(
  categoryIds: string[],
  gallery?: 'at-most-one-image',
): Promise<Record<string, number>> {
  const { databases, databaseId } = getRepositoryContext();
  const uniqueCategoryIds = [...new Set(categoryIds)];

  if (gallery !== 'at-most-one-image') {
    const counts = await Promise.all(
      uniqueCategoryIds.map(async (categoryId) => {
        const result = await databases.listDocuments<ProductDoc>({
          databaseId,
          collectionId: C.products,
          queries: [
            Query.equal('category_id', [categoryId]),
            Query.limit(1),
            Query.select(['$id']),
          ],
        });
        return [categoryId, result.total] as const;
      }),
    );

    return Object.fromEntries(counts);
  }

  const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('is_active', true),
    Query.select(['$id', 'category_id']),
  ]);
  const imageCountByProduct = new Map<string, number>();

  const imageDocs = await listProductImagesForProducts(
    databases,
    databaseId,
    products.map((product) => product.$id),
  );
  for (const image of imageDocs) {
    imageCountByProduct.set(
      image.product_id,
      (imageCountByProduct.get(image.product_id) ?? 0) + 1,
    );
  }

  const counts = Object.fromEntries(uniqueCategoryIds.map((categoryId) => [categoryId, 0]));
  for (const product of products) {
    if ((imageCountByProduct.get(product.$id) ?? 0) <= 1 && product.category_id in counts) {
      counts[product.category_id] += 1;
    }
  }

  return counts;
}

export async function listAdminProductPage({
  page,
  pageSize,
  categoryId,
  search,
  status,
  gallery,
}: ListAdminProductPageInput): Promise<AdminProductListPage> {
  const { databases, databaseId } = getRepositoryContext();
  const requestedPage = Math.max(1, page);
  const categoryQuery = categoryId ? [Query.equal('category_id', [categoryId])] : [];
  const statusQuery = status === 'active'
    ? [Query.equal('is_active', true)]
    : status === 'inactive'
      ? [Query.equal('is_active', false)]
      : [];
  const searchTerm = search?.trim() ?? '';
  const baseQueries = [
    ...categoryQuery,
    ...statusQuery,
    Query.orderAsc('display_order'),
  ];

  if (gallery === 'at-most-one-image' || searchTerm) {
    const galleryScopeQuery = gallery === 'at-most-one-image' && !status
      ? [Query.equal('is_active', true)]
      : [];
    const products = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
      ...baseQueries,
      ...galleryScopeQuery,
      Query.select(ADMIN_PRODUCT_LIST_FIELDS),
    ]);

    const matchingSearch = searchTerm
      ? products.filter((product) => matchesSearchText(product.name, searchTerm))
      : products;

    let filtered = matchingSearch;
    if (gallery === 'at-most-one-image') {
      const imageCountByProduct = new Map<string, number>();
      const imageDocs = await listProductImagesForProducts(
        databases,
        databaseId,
        matchingSearch.map((product) => product.$id),
      );
      for (const image of imageDocs) {
        imageCountByProduct.set(
          image.product_id,
          (imageCountByProduct.get(image.product_id) ?? 0) + 1,
        );
      }
      filtered = matchingSearch.filter(
        (product) => (imageCountByProduct.get(product.$id) ?? 0) <= 1,
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);
    const offset = (currentPage - 1) * pageSize;

    return {
      items: filtered.slice(offset, offset + pageSize).map(toAdminProductListRow),
      total: filtered.length,
      page: currentPage,
      pageSize,
    };
  }

  const fetchPage = (currentPage: number) =>
    databases.listDocuments<ProductDoc>({
      databaseId,
      collectionId: C.products,
      queries: [
        ...baseQueries,
        Query.limit(pageSize),
        Query.offset((currentPage - 1) * pageSize),
        Query.select(ADMIN_PRODUCT_LIST_FIELDS),
      ],
    });
  const requestedResult = await fetchPage(requestedPage);
  const totalPages = Math.max(1, Math.ceil(requestedResult.total / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const result = currentPage === requestedPage
    ? requestedResult
    : await fetchPage(currentPage);

  return {
    items: result.documents.map(toAdminProductListRow),
    total: result.total,
    page: currentPage,
    pageSize,
  };
}

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

export async function createProductDocument(
  payload: ProductWritePayload,
  transactionId?: string,
): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();

  const priceVariantsStr =
    payload.priceVariants != null
      ? JSON.stringify(payload.priceVariants).slice(0, 4096)
      : null;

  const doc = await databases.createDocument<ProductDoc>({
    databaseId,
    collectionId: C.products,
    documentId: ID.custom(randomUUID()),
    transactionId,
    data: {
      category_id: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      price: payload.price,
      image_url: payload.imageUrl,
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

export async function updateProductDocument(
  id: string,
  payload: ProductWritePayload,
  transactionId?: string,
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
    transactionId,
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

export async function deleteProductDocument(id: string, transactionId?: string): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({ databaseId, collectionId: C.products, documentId: id, transactionId });
}

export interface ProductRelationDocumentIds {
  colorAssignmentIds: string[];
  flowerTypeAssignmentIds: string[];
  imageIds: string[];
}

export async function deleteKnownProductRelations(
  relationIds: ProductRelationDocumentIds,
  transactionId?: string,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();

  await Promise.all([
    ...relationIds.colorAssignmentIds.map((documentId) =>
      databases.deleteDocument({ databaseId, collectionId: C.colorAssignments, documentId, transactionId }),
    ),
    ...relationIds.flowerTypeAssignmentIds.map((documentId) =>
      databases.deleteDocument({ databaseId, collectionId: C.flowerTypeAssignments, documentId, transactionId }),
    ),
    ...relationIds.imageIds.map((documentId) =>
      databases.deleteDocument({ databaseId, collectionId: C.productImages, documentId, transactionId }),
    ),
  ]);
}

export async function deleteProductRelations(productId: string, transactionId?: string): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();

  const [colorAssignments, flowerAssignments, images] = await Promise.all([
    transactionId
      ? listAllDocumentsInTransaction<ColorAssignmentDoc>(
          databases,
          databaseId,
          C.colorAssignments,
          transactionId,
          [Query.equal('product_id', [productId])],
        )
      : listAllDocuments<ColorAssignmentDoc>(databases, databaseId, C.colorAssignments, [
          Query.equal('product_id', [productId]),
        ]),
    transactionId
      ? listAllDocumentsInTransaction<FlowerTypeAssignmentDoc>(
          databases,
          databaseId,
          C.flowerTypeAssignments,
          transactionId,
          [Query.equal('product_id', [productId])],
        )
      : listAllDocuments<FlowerTypeAssignmentDoc>(databases, databaseId, C.flowerTypeAssignments, [
          Query.equal('product_id', [productId]),
        ]),
    transactionId
      ? listAllDocumentsInTransaction<ProductImageDoc>(
          databases,
          databaseId,
          C.productImages,
          transactionId,
          [Query.equal('product_id', [productId])],
        )
      : listAllDocuments<ProductImageDoc>(databases, databaseId, C.productImages, [
          Query.equal('product_id', [productId]),
        ]),
  ]);

  await deleteKnownProductRelations({
    colorAssignmentIds: colorAssignments.map((assignment) => assignment.$id),
    flowerTypeAssignmentIds: flowerAssignments.map((assignment) => assignment.$id),
    imageIds: images.map((image) => image.$id),
  }, transactionId);
}

export async function getProductImageUrls(productId: string): Promise<string[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<ProductImageDoc>(databases, databaseId, C.productImages, [
    Query.equal('product_id', [productId]),
  ]);
  return docs.map((d) => d.url);
}

export interface TaxonomySyncInput {
  productId: string;
  productName: string;
  colorNames: string[];
  flowerTypeNames: string[];
  imageUrl: string;
  galleryImages: string[];
  imageAlts?: Record<string, string>;
}

export async function syncProductTaxonomyAppwrite(
  input: TaxonomySyncInput,
  transactionId?: string,
): Promise<{ code: string; message: string } | null> {
  const { databases, databaseId } = getRepositoryContext();
  const {
    productId,
    productName,
    colorNames,
    flowerTypeNames,
    imageUrl,
    galleryImages,
    imageAlts,
  } = input;
  const altFor = (url: string) => imageAlts?.[url]?.trim() || productName;

  try {
    await deleteProductRelations(productId, transactionId);

    const [allColors, allFlowers] = await Promise.all([
      transactionId
        ? listAllDocumentsInTransaction<ColorDoc>(
            databases,
            databaseId,
            C.colors,
            transactionId,
          )
        : listAllDocuments<ColorDoc>(databases, databaseId, C.colors),
      transactionId
        ? listAllDocumentsInTransaction<FlowerTypeDoc>(
            databases,
            databaseId,
            C.flowerTypes,
            transactionId,
          )
        : listAllDocuments<FlowerTypeDoc>(databases, databaseId, C.flowerTypes),
    ]);
    const colorByName = new Map(allColors.map((c) => [c.name, c.$id]));
    const colorIds = colorNames.map((n) => colorByName.get(n)).filter((id): id is string => id !== undefined);
    const flowerByName = new Map(allFlowers.map((f) => [f.name, f.$id]));
    const flowerIds = flowerTypeNames.map((n) => flowerByName.get(n)).filter((id): id is string => id !== undefined);

    const imageDocs: { url: string; altText: string; isPrimary: boolean; displayOrder: number }[] = [];
    if (imageUrl) {
      imageDocs.push({ url: imageUrl, altText: altFor(imageUrl), isPrimary: true, displayOrder: 0 });
    }
    galleryImages.forEach((url, i) => {
      if (url !== imageUrl) {
        imageDocs.push({ url, altText: altFor(url), isPrimary: false, displayOrder: i + 1 });
      }
    });

    await Promise.all([
      ...colorIds.map((colorId) =>
        databases.createDocument({ databaseId, collectionId: C.colorAssignments, documentId: ID.unique(), transactionId, data: { product_id: productId, color_id: colorId } }),
      ),
      ...flowerIds.map((flowerTypeId) =>
        databases.createDocument({ databaseId, collectionId: C.flowerTypeAssignments, documentId: ID.unique(), transactionId, data: { product_id: productId, flower_type_id: flowerTypeId } }),
      ),
      ...imageDocs.map((img) =>
        databases.createDocument({ databaseId, collectionId: C.productImages, documentId: ID.unique(), transactionId, data: { product_id: productId, url: img.url, alt_text: img.altText, is_primary: img.isPrimary, display_order: img.displayOrder } }),
      ),
    ]);

    await databases.updateDocument<ProductDoc>({
      databaseId,
      collectionId: C.products,
      documentId: productId,
      transactionId,
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

export async function createProductWithTaxonomy(
  payload: ProductWritePayload,
  taxonomy: Omit<TaxonomySyncInput, 'productId'>,
): Promise<string> {
  return withAppwriteTransaction(async (transactionId) => {
    const productId = await createProductDocument(payload, transactionId);
    const syncError = await syncProductTaxonomyAppwrite({ ...taxonomy, productId }, transactionId);
    if (syncError) throw new Error(syncError.message);
    return productId;
  });
}

export async function updateProductWithTaxonomy(
  productId: string,
  payload: ProductWritePayload,
  taxonomy: Omit<TaxonomySyncInput, 'productId'>,
): Promise<void> {
  await withAppwriteTransaction(async (transactionId) => {
    await updateProductDocument(productId, payload, transactionId);
    const syncError = await syncProductTaxonomyAppwrite({ ...taxonomy, productId }, transactionId);
    if (syncError) throw new Error(syncError.message);
  });
}

export async function deleteProductWithRelations(productId: string): Promise<void> {
  await withAppwriteTransaction(async (transactionId) => {
    await deleteProductRelations(productId, transactionId);
    await deleteProductDocument(productId, transactionId);
  });
}

export async function setProductActive(
  id: string,
  isActive: boolean,
  transactionId?: string,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<ProductDoc>({
    databaseId,
    collectionId: C.products,
    documentId: id,
    transactionId,
    data: { is_active: isActive },
  });
}

function updateProductOperation(
  databaseId: string,
  documentId: string,
  data: Record<string, unknown>,
): object {
  return {
    action: 'update',
    resourceType: 'documents',
    resourceId: documentId,
    data: { databaseId, collectionId: C.products, documentId, data },
  };
}

function deleteProductOperation(
  databaseId: string,
  collectionId: string,
  documentId: string,
): object {
  return {
    action: 'delete',
    resourceType: 'documents',
    resourceId: documentId,
    data: { databaseId, collectionId, documentId },
  };
}

async function listRelationDocumentIdsInTransaction(
  databases: ReturnType<typeof getRepositoryContext>['databases'],
  databaseId: string,
  collectionId: string,
  productIds: string[],
  transactionId: string,
): Promise<string[]> {
  const documents = await mapInBatches(
    chunkIds(productIds),
    (productIdChunk) =>
      listAllDocumentsInTransaction<Models.Document>(
        databases,
        databaseId,
        collectionId,
        transactionId,
        [Query.equal('product_id', productIdChunk), Query.select(['$id'])],
      ),
  );

  return documents.flatMap((documentBatch) => documentBatch.map((document) => document.$id));
}

export async function bulkSetProductActive(ids: string[], isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();

  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({
      transactionId,
      operations: ids.map((documentId) =>
        updateProductOperation(databaseId, documentId, { is_active: isActive })),
    }),
  );
}

export async function reorderProductsAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<ProductDoc>(databases, databaseId, C.products, [
    Query.equal('$id', orderedIds),
    Query.select(['$id', 'display_order']),
  ]);
  const slots = documents.map((document) => document.display_order).sort((a, b) => a - b);
  const presentIds = orderedIds.filter((id) => documents.some((document) => document.$id === id));

  if (slots.length !== presentIds.length) return;

  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({
      transactionId,
      operations: presentIds.map((documentId, index) =>
        updateProductOperation(databaseId, documentId, { display_order: slots[index] })),
    }),
  );
}

export interface DeletedProductMetadata {
  categoryId: string;
  categorySlug: string | null;
  imageUrls: string[];
  slug: string;
}

export async function bulkDeleteProductsWithRelations(
  ids: string[],
): Promise<DeletedProductMetadata[]> {
  const { databases, databaseId } = getRepositoryContext();

  return withAppwriteTransaction(async (transactionId) => {
    const [products, colorAssignmentIds, flowerTypeAssignmentIds, images] = await Promise.all([
      listAllDocumentsInTransaction<ProductDoc>(
        databases,
        databaseId,
        C.products,
        transactionId,
        [Query.equal('$id', ids)],
      ),
      listRelationDocumentIdsInTransaction(
        databases,
        databaseId,
        C.colorAssignments,
        ids,
        transactionId,
      ),
      listRelationDocumentIdsInTransaction(
        databases,
        databaseId,
        C.flowerTypeAssignments,
        ids,
        transactionId,
      ),
      listAllDocumentsInTransaction<ProductImageDoc>(
        databases,
        databaseId,
        C.productImages,
        transactionId,
        [Query.equal('product_id', ids)],
      ),
    ]);
    const categoryIds = [...new Set(products.map((product) => product.category_id))];
    const categories = categoryIds.length === 0
      ? []
      : await listAllDocumentsInTransaction<CategoryDoc>(
          databases,
          databaseId,
          C.categories,
          transactionId,
          [Query.equal('$id', categoryIds)],
        );
    const categorySlugById = new Map(categories.map((category) => [category.$id, category.slug]));
    const imageUrlsByProductId = new Map<string, string[]>();
    for (const image of images) {
      const urls = imageUrlsByProductId.get(image.product_id) ?? [];
      urls.push(image.url);
      imageUrlsByProductId.set(image.product_id, urls);
    }
    const deletedProducts = products.map((product) => ({
      categoryId: product.category_id,
      categorySlug: categorySlugById.get(product.category_id) ?? null,
      imageUrls: [...new Set([product.image_url, ...(imageUrlsByProductId.get(product.$id) ?? [])])]
        .filter((url) => url.length > 0),
      slug: product.slug,
    }));

    await databases.createOperations({
      transactionId,
      operations: [
        ...colorAssignmentIds.map((documentId) =>
          deleteProductOperation(databaseId, C.colorAssignments, documentId)),
        ...flowerTypeAssignmentIds.map((documentId) =>
          deleteProductOperation(databaseId, C.flowerTypeAssignments, documentId)),
        ...images.map((image) => deleteProductOperation(databaseId, C.productImages, image.$id)),
        ...products.map((product) => deleteProductOperation(databaseId, C.products, product.$id)),
      ],
    });

    return deletedProducts;
  });
}

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

export async function getCategorySlugById(categoryId: string): Promise<string | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<CategoryDoc>({ databaseId, collectionId: C.categories, documentId: categoryId });
    return doc.slug;
  } catch {
    return null;
  }
}

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
  const chunkResults = await Promise.all(
    chunks.map((chunk) =>
      listAllDocuments<CategoryDoc>(databases, databaseId, C.categories, [
        Query.equal('$id', chunk),
        Query.select(['$id', 'slug']),
      ]),
    ),
  );
  for (const categoryDocs of chunkResults) {
    for (const cat of categoryDocs) {
      slugMap.set(cat.$id, cat.slug);
    }
  }

  return slugMap;
}
