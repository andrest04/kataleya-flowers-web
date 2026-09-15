import { randomUUID } from 'node:crypto';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import { chunkIds, type DocumentRecord, type DocumentStore } from '@/lib/database/types';

import type {
  ColorRepoRow,
  FlowerTypeRepoRow,
  NewColorInput,
  RenameOutcome,
  TaxonomyRepository,
  TaxonomyUsage,
} from './types';

const C = APPWRITE_COLLECTIONS;

interface ProductNameRecord extends DocumentRecord {
  name: string;
}

interface AssignmentRecord extends DocumentRecord {
  product_id: string;
}

interface OrderedRecord extends DocumentRecord {
  display_order: number;
}

function normalizeName(value: string): string {
  return value.toLowerCase().trim();
}

function toLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().trim();
}

export function createTaxonomyRepository(store: DocumentStore): TaxonomyRepository {
  async function getNextOrder(collectionId: string): Promise<number> {
    const [latest] = await store.listAll<OrderedRecord>(collectionId, {
      orderBy: { field: 'display_order', direction: 'desc' },
      limit: 1,
    });
    return (latest?.display_order ?? 0) + 1;
  }

  async function resolveProductNames(productIds: string[]): Promise<TaxonomyUsage[]> {
    if (productIds.length === 0) return [];

    const chunkedResults = await Promise.all(
      chunkIds(productIds).map((chunk) =>
        Promise.all(chunk.map((id) => store.getById<ProductNameRecord>(C.products, id))),
      ),
    );

    return chunkedResults
      .flat()
      .filter((product): product is ProductNameRecord => product !== null)
      .map((product) => ({ product_id: product.id, product_name: product.name }));
  }

  return {
    async listColors(): Promise<ColorRepoRow[]> {
      return store.listAll<ColorRepoRow>(C.colors, {
        orderBy: { field: 'display_order', direction: 'asc' },
      });
    },

    async listFlowerTypes(): Promise<FlowerTypeRepoRow[]> {
      return store.listAll<FlowerTypeRepoRow>(C.flowerTypes, {
        orderBy: { field: 'display_order', direction: 'asc' },
      });
    },

    async getColorUsage(name: string): Promise<TaxonomyUsage[]> {
      const color = await store.findOne<ColorRepoRow>(C.colors, { equal: { name } });
      if (!color) return [];

      const assignments = await store.listAll<AssignmentRecord>(C.colorAssignments, {
        equal: { color_id: color.id },
      });
      return resolveProductNames(assignments.map((a) => a.product_id));
    },

    async getFlowerTypeUsage(name: string): Promise<TaxonomyUsage[]> {
      const flowerType = await store.findOne<FlowerTypeRepoRow>(C.flowerTypes, { equal: { name } });
      if (!flowerType) return [];

      const assignments = await store.listAll<AssignmentRecord>(C.flowerTypeAssignments, {
        equal: { flower_type_id: flowerType.id },
      });
      return resolveProductNames(assignments.map((a) => a.product_id));
    },

    async ensureColors(colors: NewColorInput[]): Promise<void> {
      if (colors.length === 0) return;

      const existing = await store.listAll<ColorRepoRow>(C.colors);
      const existingNames = new Set(existing.map((c) => c.name));
      const newColors = colors.filter((c) => !existingNames.has(normalizeName(c.name)));
      if (newColors.length === 0) return;

      const nextOrder = await getNextOrder(C.colors);

      await Promise.all(
        newColors.map((c, index) =>
          store.create<ColorRepoRow>(C.colors, randomUUID(), {
            name: normalizeName(c.name),
            label: toLabel(c.name),
            hex: c.hex || null,
            display_order: nextOrder + index,
          }),
        ),
      );
    },

    async ensureFlowerTypes(names: string[]): Promise<void> {
      if (names.length === 0) return;

      const existing = await store.listAll<FlowerTypeRepoRow>(C.flowerTypes);
      const existingNames = new Set(existing.map((f) => f.name));
      const newNames = names.filter((n) => !existingNames.has(normalizeName(n)));
      if (newNames.length === 0) return;

      const nextOrder = await getNextOrder(C.flowerTypes);

      await Promise.all(
        newNames.map((n, index) =>
          store.create<FlowerTypeRepoRow>(C.flowerTypes, randomUUID(), {
            name: normalizeName(n),
            display_order: nextOrder + index,
          }),
        ),
      );
    },

    async deleteColor(name: string): Promise<boolean> {
      const color = await store.findOne<ColorRepoRow>(C.colors, { equal: { name } });
      if (!color) return false;
      await store.delete(C.colors, color.id);
      return true;
    },

    async renameColor(oldName: string, newName: string): Promise<RenameOutcome> {
      const normalized = normalizeName(newName);
      const color = await store.findOne<ColorRepoRow>(C.colors, { equal: { name: oldName } });
      if (!color) return 'not_found';

      const duplicate = await store.findOne<ColorRepoRow>(C.colors, { equal: { name: normalized } });
      if (duplicate) return 'duplicate';

      await store.update<ColorRepoRow>(C.colors, color.id, { name: normalized });
      return null;
    },

    async deleteFlowerType(name: string): Promise<boolean> {
      const flowerType = await store.findOne<FlowerTypeRepoRow>(C.flowerTypes, { equal: { name } });
      if (!flowerType) return false;
      await store.delete(C.flowerTypes, flowerType.id);
      return true;
    },

    async renameFlowerType(oldName: string, newName: string): Promise<RenameOutcome> {
      const normalized = normalizeName(newName);
      const flowerType = await store.findOne<FlowerTypeRepoRow>(C.flowerTypes, { equal: { name: oldName } });
      if (!flowerType) return 'not_found';

      const duplicate = await store.findOne<FlowerTypeRepoRow>(C.flowerTypes, {
        equal: { name: normalized },
      });
      if (duplicate) return 'duplicate';

      await store.update<FlowerTypeRepoRow>(C.flowerTypes, flowerType.id, { name: normalized });
      return null;
    },
  };
}
