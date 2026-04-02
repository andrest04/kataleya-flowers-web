import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/features/catalog/types';
import { mapProductRow } from '@/features/catalog/queries/mappers';

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`getProducts failed: ${error.message}`);
  }

  return (data ?? []).map(mapProductRow);
}
