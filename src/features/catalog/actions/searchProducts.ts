'use server';

import type { SearchResult } from '@/components/shared/Navbar/constants';
import { categoryRepository } from '@/lib/database/repositories/categories';
import { productsRepository } from '@/lib/database/repositories/products';

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const needle = q.toLowerCase();
  const [products, categories] = await Promise.all([
    productsRepository.listActiveJoined(),
    categoryRepository.listActive(),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return products
    .filter((product) => product.name.toLowerCase().includes(needle))
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 12)
    .map((product) => {
      const category = categoryById.get(product.categoryId);
      return {
        name: product.name,
        slug: product.slug,
        categorySlug: category?.slug ?? '',
        categoryName: category?.name ?? '',
        price: product.price,
        hasVariants: (product.priceVariants?.length ?? 0) > 0,
        imageUrl: product.imageUrl,
      };
    });
}
