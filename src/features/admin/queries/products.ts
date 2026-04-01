import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type ProductRow = Database['public']['Tables']['products']['Row'];

export async function getAdminProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}
