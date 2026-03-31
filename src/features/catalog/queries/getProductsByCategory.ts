import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/features/catalog/types';
import { mapProductRow } from '@/features/catalog/queries/mappers';

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const supabase = await createClient();

  // First resolve the category id from slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
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
    .select('*')
    .eq('category_id', category.id)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`getProductsByCategory failed: ${error.message}`);
  }

  return (data ?? []).map(mapProductRow);
}
