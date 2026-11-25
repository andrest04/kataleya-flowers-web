'use server';

import { z } from 'zod';

import type { SearchResult } from '@/components/shared/Navbar/constants';
import { getCategories } from '@/features/catalog/queries/getCategories';
import { getProducts } from '@/features/catalog/queries/getProducts';

const MAX_SEARCH_RESULTS = 12;
const searchQuerySchema = z.string().trim().min(1).max(100);

export async function searchProducts(query: unknown): Promise<SearchResult[]> {
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) return [];

  const needle = parsed.data.toLowerCase();
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return products
    .filter((product) => product.name.toLowerCase().includes(needle))
    .slice(0, MAX_SEARCH_RESULTS)
    .map((product) => {
      const category = categoryById.get(product.categoryId);
      return {
        name: product.name,
        slug: product.slug,
        categorySlug: category?.slug ?? '',
        categoryName: category?.name ?? '',
        price: product.price,
        hasVariants: (product.priceTable?.length ?? 0) > 0,
        imageUrl: product.imageUrl,
      };
    });
}
