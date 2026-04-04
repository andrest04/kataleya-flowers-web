import { createStaticClient } from '@/lib/supabase/static';
import type { Product } from '@/features/catalog/types';
import { mapProductRow } from '@/features/catalog/queries/mappers';

export async function getProducts(): Promise<Product[]> {
  const supabase = createStaticClient();

  const [productsResult, activeCategoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('categories')
      .select('id')
      .eq('is_active', true),
  ]);

  if (productsResult.error) {
    throw new Error(`getProducts failed: ${productsResult.error.message}`);
  }

  const activeCategoryIds = new Set(
    (activeCategoriesResult.data ?? []).map((c) => c.id),
  );

  return (productsResult.data ?? [])
    .filter((row) => activeCategoryIds.has(row.category_id))
    .map(mapProductRow);
}
