import { unstable_cache } from 'next/cache';

import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { listActiveJoinedProducts } from '@/lib/appwrite/repositories/products';

const getCachedActiveJoinedProducts = unstable_cache(
  listActiveJoinedProducts,
  ['catalog-active-joined-products'],
  { tags: ['catalog-products'], revalidate: 3600 },
);

export async function getProducts(): Promise<Product[]> {
  const rows = await getCachedActiveJoinedProducts();
  return rows.map(mapProductRow);
}
