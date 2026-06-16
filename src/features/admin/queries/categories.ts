import {
  type CategoryRepoRow,
  findCategoryById,
  listAllCategories,
} from '@/lib/appwrite/repositories/categories';
import type { CategoryRow } from '@/lib/db/rows';

export type { CategoryRow };
export type { CategoryRepoRow };

export async function getAdminCategories(): Promise<CategoryRow[]> {
  return listAllCategories() as unknown as CategoryRow[];
}

export async function getAdminCategoryById(id: string): Promise<CategoryRow | null> {
  const row = await findCategoryById(id);
  return row as unknown as CategoryRow | null;
}
