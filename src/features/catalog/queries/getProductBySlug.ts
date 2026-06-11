import type { JoinedProductRow } from '@/features/catalog/queries/mappers';
import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { isAppwriteBackend } from '@/lib/appwrite/config';
import { findActiveJoinedProductBySlug } from '@/lib/appwrite/repositories/products';
import { createStaticClient } from '@/lib/supabase/static';

const PRODUCT_SELECT = `
  *,
  product_color_assignments(product_colors(name)),
  product_flower_type_assignments(flower_types(name)),
  product_images(url, alt_text, is_primary, display_order)
` as const;

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isAppwriteBackend()) {
    const row = await findActiveJoinedProductBySlug(slug);
    return row ? mapProductRow(row) : null;
  }

  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
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

  return data ? mapProductRow(data as unknown as JoinedProductRow) : null;
}
