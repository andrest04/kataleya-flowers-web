'use server';

import type { SearchResult } from '@/components/shared/Navbar/constants';
import { listActiveCategories } from '@/lib/appwrite/repositories/categories';
import { listActiveJoinedProducts } from '@/lib/appwrite/repositories/products';

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const needle = q.toLowerCase();
  const [rows, categories] = await Promise.all([
    listActiveJoinedProducts(),
    listActiveCategories(),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return rows
    .filter((row) => row.name.toLowerCase().includes(needle))
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 12)
    .map((row) => {
      const category = categoryById.get(row.category_id);
      return {
        name: row.name,
        slug: row.slug,
        categorySlug: category?.slug ?? '',
        categoryName: category?.name ?? '',
        price: Number(row.price),
        hasVariants:
          Array.isArray(row.price_variants) && row.price_variants.length > 0,
        imageUrl: row.image_url ?? '',
      };
    });
}
