'use server';

import { getCategories } from '@/features/catalog/queries/getCategories';
import type { Category } from '@/features/catalog/types';

export interface CatalogMenu {
  categories: Category[];
}

export async function getCatalogMenu(): Promise<CatalogMenu> {
  const categories = await getCategories();
  return { categories };
}
