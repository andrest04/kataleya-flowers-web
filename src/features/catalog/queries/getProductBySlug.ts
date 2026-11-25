import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { getCategories } from '@/features/catalog/queries/getCategories';
import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { productsRepository } from '@/lib/database/repositories/products';

const getCachedActiveJoinedProductBySlug = unstable_cache(
  (slug: string) => productsRepository.findActiveJoinedBySlug(slug),
  ['catalog-product'],
  { tags: ['catalog-products'], revalidate: 3600 },
);

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const [row, categories] = await Promise.all([
    getCachedActiveJoinedProductBySlug(slug),
    getCategories(),
  ]);
  if (!row || !categories.some((category) => category.id === row.categoryId)) return null;
  return mapProductRow(row);
});
