import { isAppwriteBackend } from '@/lib/appwrite/config';
import {
  type CategoryRepoRow,
  findCategoryById,
  listAllCategories,
} from '@/lib/appwrite/repositories/categories';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type { CategoryRepoRow };

export async function getAdminCategories(): Promise<CategoryRow[]> {
  if (isAppwriteBackend()) {
    return listAllCategories() as unknown as CategoryRow[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminCategoryById(id: string): Promise<CategoryRow | null> {
  if (isAppwriteBackend()) {
    const row = await findCategoryById(id);
    return row as unknown as CategoryRow | null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}
