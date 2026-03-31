import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { Product } from '@/features/catalog/types';

type ProductRow = Database['public']['Tables']['products']['Row'];

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    categoryId: row.category_id,
    imageUrl: row.image_url,
    images: row.images ?? [],
    includes: (row.includes as string[]) ?? [],
    occasion: row.occasion ?? undefined,
    note: row.note ?? undefined,
    colors: row.colors ?? [],
    flowerTypes: row.flower_types ?? [],
    priceTable: row.price_variants
      ? (row.price_variants as { label: string; price: number }[])
      : undefined,
  };
}

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
