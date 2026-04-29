import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { createStaticClient } from '@/lib/supabase/static';

export async function getProducts(): Promise<Product[]> {
  const supabase = createStaticClient();

  // !inner join ensures only products with an active category are returned
  const { data, error } = await supabase
    .from('products')
    .select('*, categories!inner(id)')
    .eq('is_active', true)
    .eq('categories.is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`getProducts failed: ${error.message}`);
  }

  return (data ?? []).map(mapProductRow);
}
