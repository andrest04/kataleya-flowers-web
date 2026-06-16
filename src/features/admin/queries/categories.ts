import {
  type CategoryRepoRow,
  findCategoryById,
  listAllCategories,
} from '@/lib/appwrite/repositories/categories';
import type { Database } from '@/lib/supabase/types';

export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type { CategoryRepoRow };

export async function getAdminCategories(): Promise<CategoryRow[]> {
  return listAllCategories() as unknown as CategoryRow[];
}

export async function getAdminCategoryById(id: string): Promise<CategoryRow | null> {
  const row = await findCategoryById(id);
  return row as unknown as CategoryRow | null;
}
