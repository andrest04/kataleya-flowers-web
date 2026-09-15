import { randomUUID } from 'node:crypto';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import { chunkIds, type DocumentRecord, type DocumentStore, type TransactionHandle } from '@/lib/database/types';
import { matchesSearchText } from '@/lib/searchText';

import { type ProductDocRecord, type RelatedData,toProduct } from './mappers';
import type {
  AdminProductListPage,
  AdminProductListRow,
  DeletedProductMetadata,
  ListAdminProductPageInput,
  Product,
  ProductCategorySlug,
  ProductRelationDocumentIds,
  ProductsRepository,
  ProductTaxonomySyncInput,
  ProductWritePayload,
  SitemapProductRow,
} from './types';

const C = APPWRITE_COLLECTIONS;

interface CategoryRecord extends DocumentRecord {
  slug: string;
  is_active: boolean;
}

interface ColorAssignmentRecord extends DocumentRecord {
  product_id: string;
  color_id: string;
}

interface FlowerTypeAssignmentRecord extends DocumentRecord {
  product_id: string;
  flower_type_id: string;
}

interface ProductImageRecord extends DocumentRecord {
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

interface ColorRecord extends DocumentRecord {
  name: string;
  hex: string | null;
  label: string;
}

interface FlowerTypeRecord extends DocumentRecord {
  name: string;
}

interface AdminProductListDocRecord extends DocumentRecord {
  category_id: string;
  display_order: number;
  image_url: string;
  is_active: boolean;
  name: string;
  price: number;
  slug: string;
}

interface ProductOrderRecord extends DocumentRecord {
  display_order: number;
}

interface ProductDeleteRecord extends DocumentRecord {
  category_id: string;
  slug: string;
  image_url: string;
}

const ADMIN_PRODUCT_LIST_FIELDS = [
  'category_id',
  'display_order',
  'image_url',
  'is_active',
  'name',
  'price',
  'slug',
];

function toAdminProductListRow(doc: AdminProductListDocRecord): AdminProductListRow {
  return {
    id: doc.id,
    categoryId: doc.category_id,
    displayOrder: doc.display_order,
    imageUrl: doc.image_url,
    isActive: doc.is_active,
    name: doc.name,
    price: doc.price,
    slug: doc.slug,
  };
}

async function fetchRelated(store: DocumentStore, productIds: string[]): Promise<RelatedData> {
  const colorAssignmentsByProduct: RelatedData['colorAssignmentsByProduct'] = new Map();
  const flowerAssignmentsByProduct: RelatedData['flowerAssignmentsByProduct'] = new Map();
  const imagesByProduct: RelatedData['imagesByProduct'] = new Map();

  if (productIds.length === 0) {
    return { colorAssignmentsByProduct, flowerAssignmentsByProduct, imagesByProduct };
  }

  const [colors, flowerTypes] = await Promise.all([
    store.listAll<ColorRecord>(C.colors),
    store.listAll<FlowerTypeRecord>(C.flowerTypes),
  ]);
  const colorById = new Map(colors.map((color) => [color.id, color]));
  const flowerTypeById = new Map(flowerTypes.map((flowerType) => [flowerType.id, flowerType]));

  for (const chunk of chunkIds(productIds)) {
    const [colorAssignments, flowerAssignments, images] = await Promise.all([
      store.listAll<ColorAssignmentRecord>(C.colorAssignments, { equal: { product_id: chunk } }),
      store.listAll<FlowerTypeAssignmentRecord>(C.flowerTypeAssignments, {
        equal: { product_id: chunk },
      }),
      store.listAll<ProductImageRecord>(C.productImages, {
        equal: { product_id: chunk },
        orderBy: { field: 'display_order', direction: 'asc' },
      }),
    ]);

    for (const assignment of colorAssignments) {
      const color = colorById.get(assignment.color_id);
      const list = colorAssignmentsByProduct.get(assignment.product_id) ?? [];
      list.push({
        colorId: assignment.color_id,
        color: color
          ? { id: color.id, name: color.name, hex: color.hex, label: color.label }
          : null,
      });
      colorAssignmentsByProduct.set(assignment.product_id, list);
    }

    for (const assignment of flowerAssignments) {
      const flowerType = flowerTypeById.get(assignment.flower_type_id);
      const list = flowerAssignmentsByProduct.get(assignment.product_id) ?? [];
      list.push({
        flowerTypeId: assignment.flower_type_id,
        flowerType: flowerType ? { id: flowerType.id, name: flowerType.name } : null,
      });
      flowerAssignmentsByProduct.set(assignment.product_id, list);
    }

    for (const image of images) {
      const list = imagesByProduct.get(image.product_id) ?? [];
      list.push({
        id: image.id,
        url: image.url,
        altText: image.alt_text,
        isPrimary: image.is_primary,
        displayOrder: image.display_order,
      });
      imagesByProduct.set(image.product_id, list);
    }
  }

  return { colorAssignmentsByProduct, flowerAssignmentsByProduct, imagesByProduct };
}

async function joinProducts(store: DocumentStore, products: ProductDocRecord[]): Promise<Product[]> {
  const related = await fetchRelated(store, products.map((product) => product.id));
  return products.map((product) => toProduct(product, related));
}

async function countImagesByProduct(
  store: DocumentStore,
  productIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (productIds.length === 0) return counts;

  const chunkedResults = await Promise.all(
    chunkIds(productIds).map((chunk) =>
      store.listAll<ProductImageRecord>(C.productImages, {
        equal: { product_id: chunk },
        select: ['product_id'],
      }),
    ),
  );

  for (const images of chunkedResults) {
    for (const image of images) {
      counts.set(image.product_id, (counts.get(image.product_id) ?? 0) + 1);
    }
  }

  return counts;
}

function toProductDocumentData(
  payload: ProductWritePayload,
  options: { includeRelationCaches: boolean },
): Record<string, unknown> {
  const priceVariantsStr =
    payload.priceVariants != null ? JSON.stringify(payload.priceVariants).slice(0, 4096) : null;

  const data: Record<string, unknown> = {
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
  };

  if (options.includeRelationCaches) {
    data.images = [];
    data.colors = [];
    data.flower_types = [];
  }

  return data;
}

export async function deleteKnownProductRelations(
  tx: TransactionHandle,
  relationIds: ProductRelationDocumentIds,
): Promise<void> {
  await tx.bulkDelete([
    ...relationIds.colorAssignmentIds.map((id) => ({ collectionId: C.colorAssignments, id })),
    ...relationIds.flowerTypeAssignmentIds.map((id) => ({ collectionId: C.flowerTypeAssignments, id })),
    ...relationIds.imageIds.map((id) => ({ collectionId: C.productImages, id })),
  ]);
}

async function syncProductTaxonomy(
  store: DocumentStore,
  tx: TransactionHandle,
  productId: string,
  taxonomy: ProductTaxonomySyncInput,
): Promise<void> {
  const [existingColorAssignments, existingFlowerAssignments, existingImages, allColors, allFlowerTypes] =
    await Promise.all([
      store.listAll<ColorAssignmentRecord>(C.colorAssignments, { equal: { product_id: [productId] } }),
      store.listAll<FlowerTypeAssignmentRecord>(C.flowerTypeAssignments, { equal: { product_id: [productId] } }),
      store.listAll<ProductImageRecord>(C.productImages, { equal: { product_id: [productId] } }),
      store.listAll<ColorRecord>(C.colors),
      store.listAll<FlowerTypeRecord>(C.flowerTypes),
    ]);

  await deleteKnownProductRelations(tx, {
    colorAssignmentIds: existingColorAssignments.map((assignment) => assignment.id),
    flowerTypeAssignmentIds: existingFlowerAssignments.map((assignment) => assignment.id),
    imageIds: existingImages.map((image) => image.id),
  });

  const colorIdByName = new Map(allColors.map((color) => [color.name, color.id]));
  const colorIds = taxonomy.colorNames.flatMap((name) => {
    const id = colorIdByName.get(name);
    return id ? [id] : [];
  });

  const flowerTypeIdByName = new Map(allFlowerTypes.map((flowerType) => [flowerType.name, flowerType.id]));
  const flowerTypeIds = taxonomy.flowerTypeNames.flatMap((name) => {
    const id = flowerTypeIdByName.get(name);
    return id ? [id] : [];
  });

  const altFor = (url: string) => taxonomy.imageAlts?.[url]?.trim() || taxonomy.productName;
  const imageDocs: { url: string; altText: string; isPrimary: boolean; displayOrder: number }[] = [];
  if (taxonomy.imageUrl) {
    imageDocs.push({ url: taxonomy.imageUrl, altText: altFor(taxonomy.imageUrl), isPrimary: true, displayOrder: 0 });
  }
  taxonomy.galleryImages.forEach((url, index) => {
    if (url !== taxonomy.imageUrl) {
      imageDocs.push({ url, altText: altFor(url), isPrimary: false, displayOrder: index + 1 });
    }
  });

  await Promise.all([
    ...colorIds.map((colorId) =>
      tx.create(C.colorAssignments, randomUUID(), { product_id: productId, color_id: colorId }),
    ),
    ...flowerTypeIds.map((flowerTypeId) =>
      tx.create(C.flowerTypeAssignments, randomUUID(), { product_id: productId, flower_type_id: flowerTypeId }),
    ),
    ...imageDocs.map((image) =>
      tx.create(C.productImages, randomUUID(), {
        product_id: productId,
        url: image.url,
        alt_text: image.altText,
        is_primary: image.isPrimary,
        display_order: image.displayOrder,
      }),
    ),
  ]);

  await tx.update(C.products, productId, {
    images: imageDocs.map((image) => image.url),
    colors: taxonomy.colorNames,
    flower_types: taxonomy.flowerTypeNames,
  });
}

export function createProductsRepository(store: DocumentStore): ProductsRepository {
  return {
    async listActiveJoined(): Promise<Product[]> {
      const [products, activeCategories] = await Promise.all([
        store.listAll<ProductDocRecord>(C.products, {
          equal: { is_active: true },
          orderBy: { field: 'display_order', direction: 'asc' },
        }),
        store.listAll<CategoryRecord>(C.categories, { equal: { is_active: true } }),
      ]);
      const activeCategoryIds = new Set(activeCategories.map((category) => category.id));
      const visible = products.filter((product) => activeCategoryIds.has(product.category_id));
      return joinProducts(store, visible);
    },

    async findActiveJoinedBySlug(slug: string): Promise<Product | null> {
      const product = await store.findOne<ProductDocRecord>(C.products, {
        equal: { slug, is_active: true },
      });
      if (!product) return null;
      const [joined] = await joinProducts(store, [product]);
      return joined ?? null;
    },

    async listActiveJoinedByCategorySlug(categorySlug: string): Promise<Product[]> {
      const category = await store.findOne<CategoryRecord>(C.categories, {
        equal: { slug: categorySlug, is_active: true },
      });
      if (!category) return [];

      const products = await store.listAll<ProductDocRecord>(C.products, {
        equal: { category_id: category.id, is_active: true },
        orderBy: { field: 'display_order', direction: 'asc' },
      });
      return joinProducts(store, products);
    },

    async listSitemap(): Promise<SitemapProductRow[]> {
      const [products, activeCategories] = await Promise.all([
        store.listAll<ProductDocRecord>(C.products, { equal: { is_active: true } }),
        store.listAll<CategoryRecord>(C.categories, { equal: { is_active: true } }),
      ]);
      const categorySlugById = new Map(activeCategories.map((category) => [category.id, category.slug]));

      return products
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .flatMap((product): SitemapProductRow[] => {
          const categorySlug = categorySlugById.get(product.category_id);
          return categorySlug
            ? [{ slug: product.slug, categorySlug, updatedAt: product.updatedAt }]
            : [];
        });
    },

    async listAdmin(): Promise<Product[]> {
      const products = await store.listAll<ProductDocRecord>(C.products, {
        orderBy: { field: 'display_order', direction: 'asc' },
      });
      return joinProducts(store, products);
    },

    async listAdminPage(input: ListAdminProductPageInput): Promise<AdminProductListPage> {
      const requestedPage = Math.max(1, input.page);
      const searchTerm = input.search?.trim() ?? '';
      const equal: Record<string, string | number | boolean | string[]> = {};
      if (input.categoryId) {
        equal.category_id = [input.categoryId];
      }
      if (input.status === 'active') {
        equal.is_active = true;
      } else if (input.status === 'inactive') {
        equal.is_active = false;
      } else if (input.gallery === 'at-most-one-image') {
        equal.is_active = true;
      }

      const products = await store.listAll<AdminProductListDocRecord>(C.products, {
        equal,
        orderBy: { field: 'display_order', direction: 'asc' },
        select: ADMIN_PRODUCT_LIST_FIELDS,
      });

      const matchingSearch = searchTerm
        ? products.filter((product) => matchesSearchText(product.name, searchTerm))
        : products;

      let filtered = matchingSearch;
      if (input.gallery === 'at-most-one-image') {
        const imageCounts = await countImagesByProduct(store, matchingSearch.map((product) => product.id));
        filtered = matchingSearch.filter((product) => (imageCounts.get(product.id) ?? 0) <= 1);
      }

      const totalPages = Math.max(1, Math.ceil(filtered.length / input.pageSize));
      const currentPage = Math.min(requestedPage, totalPages);
      const offset = (currentPage - 1) * input.pageSize;

      return {
        items: filtered.slice(offset, offset + input.pageSize).map(toAdminProductListRow),
        total: filtered.length,
        page: currentPage,
        pageSize: input.pageSize,
      };
    },

    async findAdminById(id: string): Promise<Product | null> {
      const doc = await store.getById<ProductDocRecord>(C.products, id);
      if (!doc) return null;
      const [joined] = await joinProducts(store, [doc]);
      return joined ?? null;
    },

    async listAdminCategoryCounts(
      categoryIds: string[],
      gallery?: 'at-most-one-image',
    ): Promise<Record<string, number>> {
      const uniqueCategoryIds = [...new Set(categoryIds)];

      if (gallery !== 'at-most-one-image') {
        const entries = await Promise.all(
          uniqueCategoryIds.map(async (categoryId) => {
            const products = await store.listAll<DocumentRecord>(C.products, {
              equal: { category_id: [categoryId] },
              select: ['category_id'],
            });
            return [categoryId, products.length] as const;
          }),
        );
        return Object.fromEntries(entries);
      }

      const products = await store.listAll<AdminProductListDocRecord>(C.products, {
        equal: { is_active: true },
        select: ['category_id'],
      });
      const imageCounts = await countImagesByProduct(store, products.map((product) => product.id));

      const counts: Record<string, number> = Object.fromEntries(
        uniqueCategoryIds.map((categoryId) => [categoryId, 0]),
      );
      for (const product of products) {
        if ((imageCounts.get(product.id) ?? 0) <= 1 && product.category_id in counts) {
          counts[product.category_id] += 1;
        }
      }
      return counts;
    },

    async getImageUrls(productId: string): Promise<string[]> {
      const images = await store.listAll<ProductImageRecord>(C.productImages, {
        equal: { product_id: [productId] },
      });
      return images.map((image) => image.url);
    },

    async getNextOrder(): Promise<number> {
      const last = await store.findOne<{ display_order: number } & DocumentRecord>(C.products, {
        orderBy: { field: 'display_order', direction: 'desc' },
      });
      return (last?.display_order ?? 0) + 1;
    },

    async getCategorySlug(productId: string): Promise<ProductCategorySlug | null> {
      const product = await store.getById<{ category_id: string } & DocumentRecord>(C.products, productId);
      if (!product) return null;
      const category = await store.getById<CategoryRecord>(C.categories, product.category_id);
      if (!category) return null;
      return { categoryId: product.category_id, categorySlug: category.slug };
    },

    async getSlugById(id: string): Promise<string | null> {
      const doc = await store.getById<{ slug: string } & DocumentRecord>(C.products, id);
      return doc?.slug ?? null;
    },

    async getCategorySlugById(categoryId: string): Promise<string | null> {
      const doc = await store.getById<CategoryRecord>(C.categories, categoryId);
      return doc?.slug ?? null;
    },

    async getCategorySlugsForProducts(productIds: string[]): Promise<Map<string, string>> {
      const products = await Promise.all(
        productIds.map((id) => store.getById<{ category_id: string } & DocumentRecord>(C.products, id)),
      );
      const categoryIds = [...new Set(products.flatMap((doc) => (doc ? [doc.category_id] : [])))];
      if (categoryIds.length === 0) return new Map();

      const categories = await Promise.all(
        categoryIds.map((categoryId) => store.getById<CategoryRecord>(C.categories, categoryId)),
      );

      const slugMap = new Map<string, string>();
      for (const category of categories) {
        if (category) slugMap.set(category.id, category.slug);
      }
      return slugMap;
    },

    async createProductDocument(payload: ProductWritePayload): Promise<string> {
      const id = randomUUID();
      await store.create(C.products, id, toProductDocumentData(payload, { includeRelationCaches: true }));
      return id;
    },

    async updateProductDocument(id: string, payload: ProductWritePayload): Promise<void> {
      await store.update(C.products, id, toProductDocumentData(payload, { includeRelationCaches: false }));
    },

    async deleteProductDocument(id: string): Promise<void> {
      await store.delete(C.products, id);
    },

    async createProductWithTaxonomy(
      payload: ProductWritePayload,
      taxonomy: ProductTaxonomySyncInput,
    ): Promise<string> {
      const id = randomUUID();
      await store.runInTransaction(async (tx) => {
        await tx.create(C.products, id, toProductDocumentData(payload, { includeRelationCaches: true }));
        await syncProductTaxonomy(store, tx, id, taxonomy);
      });
      return id;
    },

    async updateProductWithTaxonomy(
      id: string,
      payload: ProductWritePayload,
      taxonomy: ProductTaxonomySyncInput,
    ): Promise<void> {
      await store.runInTransaction(async (tx) => {
        await tx.update(C.products, id, toProductDocumentData(payload, { includeRelationCaches: false }));
        await syncProductTaxonomy(store, tx, id, taxonomy);
      });
    },

    async deleteProductWithRelations(id: string): Promise<void> {
      const [colorAssignments, flowerAssignments, images] = await Promise.all([
        store.listAll<ColorAssignmentRecord>(C.colorAssignments, { equal: { product_id: [id] } }),
        store.listAll<FlowerTypeAssignmentRecord>(C.flowerTypeAssignments, { equal: { product_id: [id] } }),
        store.listAll<ProductImageRecord>(C.productImages, { equal: { product_id: [id] } }),
      ]);

      await store.runInTransaction(async (tx) => {
        await deleteKnownProductRelations(tx, {
          colorAssignmentIds: colorAssignments.map((assignment) => assignment.id),
          flowerTypeAssignmentIds: flowerAssignments.map((assignment) => assignment.id),
          imageIds: images.map((image) => image.id),
        });
        await tx.delete(C.products, id);
      });
    },

    async setProductActive(id: string, isActive: boolean): Promise<void> {
      await store.update(C.products, id, { is_active: isActive });
    },

    async bulkSetProductActive(ids: string[], isActive: boolean): Promise<void> {
      await store.runInTransaction((tx) =>
        tx.bulkUpdate(ids.map((id) => ({ collectionId: C.products, id, data: { is_active: isActive } }))),
      );
    },

    async reorderProductsAppwrite(orderedIds: string[]): Promise<void> {
      const documents = await Promise.all(
        orderedIds.map((id) => store.getById<ProductOrderRecord>(C.products, id)),
      );
      const presentDocs = documents.filter((doc): doc is ProductOrderRecord => doc !== null);
      if (presentDocs.length !== orderedIds.length) return;

      const slots = presentDocs.map((doc) => doc.display_order).sort((a, b) => a - b);

      await store.runInTransaction((tx) =>
        tx.bulkUpdate(
          orderedIds.map((id, index) => ({
            collectionId: C.products,
            id,
            data: { display_order: slots[index] },
          })),
        ),
      );
    },

    async bulkDeleteProductsWithRelations(ids: string[]): Promise<DeletedProductMetadata[]> {
      if (ids.length === 0) return [];

      const productDocs = await Promise.all(
        ids.map((id) => store.getById<ProductDeleteRecord>(C.products, id)),
      );
      const products = productDocs.filter((doc): doc is ProductDeleteRecord => doc !== null);
      if (products.length === 0) return [];

      const productIds = products.map((product) => product.id);

      const [colorAssignmentBatches, flowerAssignmentBatches, imageBatches] = await Promise.all([
        Promise.all(
          chunkIds(productIds).map((chunk) =>
            store.listAll<ColorAssignmentRecord>(C.colorAssignments, { equal: { product_id: chunk } }),
          ),
        ),
        Promise.all(
          chunkIds(productIds).map((chunk) =>
            store.listAll<FlowerTypeAssignmentRecord>(C.flowerTypeAssignments, { equal: { product_id: chunk } }),
          ),
        ),
        Promise.all(
          chunkIds(productIds).map((chunk) =>
            store.listAll<ProductImageRecord>(C.productImages, { equal: { product_id: chunk } }),
          ),
        ),
      ]);
      const colorAssignments = colorAssignmentBatches.flat();
      const flowerAssignments = flowerAssignmentBatches.flat();
      const images = imageBatches.flat();

      const categoryIds = [...new Set(products.map((product) => product.category_id))];
      const categories = await Promise.all(
        categoryIds.map((categoryId) => store.getById<CategoryRecord>(C.categories, categoryId)),
      );
      const categorySlugById = new Map(
        categoryIds.flatMap((categoryId, index) => {
          const category = categories[index];
          return category ? [[categoryId, category.slug] as const] : [];
        }),
      );

      const imageUrlsByProductId = new Map<string, string[]>();
      for (const image of images) {
        const urls = imageUrlsByProductId.get(image.product_id) ?? [];
        urls.push(image.url);
        imageUrlsByProductId.set(image.product_id, urls);
      }

      const deletedProducts: DeletedProductMetadata[] = products.map((product) => ({
        categoryId: product.category_id,
        categorySlug: categorySlugById.get(product.category_id) ?? null,
        imageUrls: [...new Set([product.image_url, ...(imageUrlsByProductId.get(product.id) ?? [])])].filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        ),
        slug: product.slug,
      }));

      await store.runInTransaction((tx) =>
        tx.bulkDelete([
          ...colorAssignments.map((assignment) => ({ collectionId: C.colorAssignments, id: assignment.id })),
          ...flowerAssignments.map((assignment) => ({ collectionId: C.flowerTypeAssignments, id: assignment.id })),
          ...images.map((image) => ({ collectionId: C.productImages, id: image.id })),
          ...products.map((product) => ({ collectionId: C.products, id: product.id })),
        ]),
      );

      return deletedProducts;
    },
  };
}
