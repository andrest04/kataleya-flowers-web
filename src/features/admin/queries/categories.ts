import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type CategoryRow = Database['public']['Tables']['categories']['Row'];

export async function getAdminCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminCategoryById(id: string): Promise<CategoryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}
