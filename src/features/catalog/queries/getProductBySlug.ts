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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
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
