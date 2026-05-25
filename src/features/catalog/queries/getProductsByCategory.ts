import type { JoinedProductRow } from '@/features/catalog/queries/mappers';
import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { createStaticClient } from '@/lib/supabase/static';

const PRODUCT_SELECT = `
  *,
  product_color_assignments(product_colors(name)),
  product_flower_type_assignments(flower_types(name)),
  product_images(url, alt_text, is_primary, display_order)
` as const;

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const supabase = createStaticClient();

  // First resolve the category id from slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single();

  if (categoryError) {
    if (categoryError.code === 'PGRST116') {
      return [];
    }
    throw new Error(
      `getProductsByCategory — resolving category failed: ${categoryError.message}`
    );
  }

  if (!category) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`getProductsByCategory failed: ${error.message}`);
  }

  return (data ?? []).map((row) => mapProductRow(row as unknown as JoinedProductRow));
}
