'use server';

import type { SearchResult } from '@/components/shared/Navbar/constants';
import { createClient } from '@/lib/supabase/server';

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('name, slug, price, price_variants, image_url, category_id, categories!inner(slug, name)')
    .ilike('name', `%${q}%`)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(6);

  if (error) return [];

  return (data ?? []).map((row) => {
    const category = row.categories as unknown as { slug: string; name: string };
    return {
      name: row.name,
      slug: row.slug,
      categorySlug: category.slug,
      categoryName: category.name,
      price: Number(row.price),
      hasVariants: Array.isArray(row.price_variants) && row.price_variants.length > 0,
      imageUrl: row.image_url,
    };
  });
}
