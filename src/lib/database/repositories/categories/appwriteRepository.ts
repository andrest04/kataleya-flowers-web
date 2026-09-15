import { randomUUID } from 'node:crypto';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import { deleteKnownProductRelations } from '@/lib/database/repositories/products';

import { chunkIds, type DocumentRecord, type DocumentStore } from '../../types';
import type { Category, CategoryRepository, CategoryWritePayload } from './types';

const C = APPWRITE_COLLECTIONS;

interface CategoryDocRecord extends DocumentRecord {
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  occasion: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
}

interface ProductPriceRecord extends DocumentRecord {
  category_id: string;
  price: number;
}

interface ProductCategoryRecord extends DocumentRecord {
  category_id: string;
}

interface ProductRelationIdRecord extends DocumentRecord {
  product_id: string;
}

interface ProductImageUrlRecord extends DocumentRecord {
  product_id: string;
  url: string;
}

function toCategory(doc: CategoryDocRecord): Category {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    imageUrl: doc.image_url,
    occasion: doc.occasion,
    displayOrder: doc.display_order,
    isActive: doc.is_active,
    isFeatured: doc.is_featured,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toDocumentData(payload: CategoryWritePayload): Record<string, unknown> {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    occasion: payload.occasion,
    image_url: payload.imageUrl,
    display_order: payload.displayOrder,
    is_active: payload.isActive,
    is_featured: payload.isFeatured,
  };
}

async function deleteCategoryCascade(store: DocumentStore, categoryId: string): Promise<string[]> {
  const products = await store.listAll<ProductCategoryRecord>(C.products, {
    equal: { category_id: [categoryId] },
  });
  const productIds = products.map((product) => product.id);
  const idChunks = chunkIds(productIds);

  const [colorAssignmentBatches, flowerTypeAssignmentBatches, imageBatches] = await Promise.all([
    Promise.all(
      idChunks.map((chunk) =>
        store.listAll<ProductRelationIdRecord>(C.colorAssignments, { equal: { product_id: chunk } }),
      ),
    ),
    Promise.all(
      idChunks.map((chunk) =>
        store.listAll<ProductRelationIdRecord>(C.flowerTypeAssignments, { equal: { product_id: chunk } }),
      ),
    ),
    Promise.all(
      idChunks.map((chunk) =>
        store.listAll<ProductImageUrlRecord>(C.productImages, { equal: { product_id: chunk } }),
      ),
    ),
  ]);
  const colorAssignments = colorAssignmentBatches.flat();
  const flowerTypeAssignments = flowerTypeAssignmentBatches.flat();
  const images = imageBatches.flat();
  const imageUrls = images.map((image) => image.url);

  await store.runInTransaction(async (tx) => {
    await deleteKnownProductRelations(tx, {
      colorAssignmentIds: colorAssignments.map((assignment) => assignment.id),
      flowerTypeAssignmentIds: flowerTypeAssignments.map((assignment) => assignment.id),
      imageIds: images.map((image) => image.id),
    });
    await tx.bulkDelete(products.map((product) => ({ collectionId: C.products, id: product.id })));
    await tx.delete(C.categories, categoryId);
  });

  return imageUrls;
}

async function deleteCategoryReassign(
  store: DocumentStore,
  categoryId: string,
  reassignToId: string,
): Promise<string | null> {
  const [products, category] = await Promise.all([
    store.listAll<ProductCategoryRecord>(C.products, { equal: { category_id: [categoryId] } }),
    store.getById<CategoryDocRecord>(C.categories, categoryId),
  ]);

  await store.runInTransaction(async (tx) => {
    await tx.bulkUpdate(
      products.map((product) => ({
        collectionId: C.products,
        id: product.id,
        data: { category_id: reassignToId },
      })),
    );
    await tx.delete(C.categories, categoryId);
  });

  return category?.image_url ?? null;
}

export function createCategoryRepository(store: DocumentStore): CategoryRepository {
  return {
    async listActive(): Promise<Category[]> {
      const docs = await store.listAll<CategoryDocRecord>(C.categories, {
        equal: { is_active: true },
        orderBy: { field: 'display_order', direction: 'asc' },
      });
      return docs.map(toCategory);
    },

    async listAll(): Promise<Category[]> {
      const docs = await store.listAll<CategoryDocRecord>(C.categories, {
        orderBy: { field: 'display_order', direction: 'asc' },
      });
      return docs.map(toCategory);
    },

    async findById(id: string): Promise<Category | null> {
      const doc = await store.getById<CategoryDocRecord>(C.categories, id);
      return doc ? toCategory(doc) : null;
    },

    async listPriceFrom(): Promise<Map<string, number>> {
      const products = await store.listAll<ProductPriceRecord>(C.products, {
        equal: { is_active: true },
        select: ['category_id', 'price'],
      });

      const priceFromByCategory = new Map<string, number>();
      for (const product of products) {
        const current = priceFromByCategory.get(product.category_id);
        if (current === undefined || product.price < current) {
          priceFromByCategory.set(product.category_id, product.price);
        }
      }
      return priceFromByCategory;
    },

    async getNextOrder(): Promise<number> {
      const last = await store.findOne<CategoryDocRecord>(C.categories, {
        orderBy: { field: 'display_order', direction: 'desc' },
      });
      return (last?.display_order ?? 0) + 1;
    },

    async create(payload: CategoryWritePayload): Promise<string> {
      const id = randomUUID();
      await store.create(C.categories, id, toDocumentData(payload));
      return id;
    },

    async update(id: string, payload: CategoryWritePayload): Promise<void> {
      await store.update(C.categories, id, toDocumentData(payload));
    },

    async countProducts(categoryId: string): Promise<number> {
      const products = await store.listAll<ProductCategoryRecord>(C.products, {
        equal: { category_id: [categoryId] },
      });
      return products.length;
    },

    deleteCascade: (categoryId: string) => deleteCategoryCascade(store, categoryId),
    deleteReassign: (categoryId: string, reassignToId: string) =>
      deleteCategoryReassign(store, categoryId, reassignToId),

    async setActive(id: string, isActive: boolean): Promise<void> {
      await store.update(C.categories, id, { is_active: isActive });
    },

    async reorder(orderedIds: string[]): Promise<void> {
      const documents = await Promise.all(
        orderedIds.map((id) => store.getById<CategoryDocRecord>(C.categories, id)),
      );
      const presentIds = orderedIds.filter((_, index) => documents[index] !== null);
      const slots = documents
        .filter((doc): doc is CategoryDocRecord => doc !== null)
        .map((doc) => doc.display_order)
        .sort((a, b) => a - b);

      if (slots.length !== presentIds.length) return;

      await store.runInTransaction((tx) =>
        tx.bulkUpdate(
          presentIds.map((id, index) => ({
            collectionId: C.categories,
            id,
            data: { display_order: slots[index] },
          })),
        ),
      );
    },

    async setFeatured(id: string, isFeatured: boolean): Promise<void> {
      await store.update(C.categories, id, { is_featured: isFeatured });
    },

    async listAllSlugs(): Promise<string[]> {
      const docs = await store.listAll<CategoryDocRecord>(C.categories, { select: ['slug'] });
      return docs.flatMap((doc) => (doc.slug ? [doc.slug] : []));
    },
  };
}
