import { unstable_cache } from 'next/cache';

import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { productsRepository } from '@/lib/database/repositories/products';

const getCachedActiveJoinedProducts = unstable_cache(
  () => productsRepository.listActiveJoined(),
  ['catalog-active-joined-products'],
  { tags: ['catalog-products'], revalidate: 3600 },
);

export async function getProducts(): Promise<Product[]> {
  const rows = await getCachedActiveJoinedProducts();
  return rows.map(mapProductRow);
}
