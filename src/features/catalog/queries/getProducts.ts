import type { JoinedProductRow } from '@/features/catalog/queries/mappers';
import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { isAppwriteBackend } from '@/lib/appwrite/config';
import { listActiveJoinedProducts } from '@/lib/appwrite/repositories/products';
import { createStaticClient } from '@/lib/supabase/static';

const PRODUCT_SELECT = `
  *,
  product_color_assignments(product_colors(name)),
  product_flower_type_assignments(flower_types(name)),
  product_images(url, alt_text, is_primary, display_order)
` as const;

export async function getProducts(): Promise<Product[]> {
  if (isAppwriteBackend()) {
    const rows = await listActiveJoinedProducts();
    return rows.map(mapProductRow);
  }

  const supabase = createStaticClient();

  // !inner join ensures only products with an active category are returned
  const { data, error } = await supabase
    .from('products')
    .select(`${PRODUCT_SELECT}, categories!inner(id)`)
    .eq('is_active', true)
    .eq('categories.is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`getProducts failed: ${error.message}`);
  }

  return (data ?? []).map((row) => mapProductRow(row as unknown as JoinedProductRow));
}
