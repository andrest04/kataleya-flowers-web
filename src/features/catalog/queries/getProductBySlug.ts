import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { createStaticClient } from '@/lib/supabase/static';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned — product not found
      return null;
    }
    throw new Error(`getProductBySlug failed: ${error.message}`);
  }

  return data ? mapProductRow(data) : null;
}
