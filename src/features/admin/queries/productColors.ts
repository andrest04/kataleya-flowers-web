import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type ProductColorRow = Database['public']['Tables']['product_colors']['Row'];

export async function getProductColors(): Promise<ProductColorRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_colors')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(`getProductColors failed: ${error.message}`);
  return data ?? [];
}

export async function getProductColorUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_product_color_usage', {
    p_name: name,
  });

  if (error) throw new Error(`getProductColorUsage failed: ${error.message}`);
  return data ?? [];
}
