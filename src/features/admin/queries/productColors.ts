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

/**
 * Returns the list of products that use a given color (by name).
 * Counts via junction table — does NOT use the old array-based RPC.
 */
export async function getProductColorUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  const supabase = await createClient();

  // Resolve color name → id first
  const { data: pc, error: pcError } = await supabase
    .from('product_colors')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (pcError) throw new Error(`getProductColorUsage (resolve id) failed: ${pcError.message}`);
  if (!pc) return [];

  const { data, error } = await supabase
    .from('product_color_assignments')
    .select('product_id, products(id, name)')
    .eq('color_id', pc.id);

  if (error) throw new Error(`getProductColorUsage failed: ${error.message}`);

  return (data ?? []).flatMap((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product || typeof product !== 'object') return [];
    const p = product as { id: string; name: string };
    return [{ product_id: p.id, product_name: p.name }];
  });
}
