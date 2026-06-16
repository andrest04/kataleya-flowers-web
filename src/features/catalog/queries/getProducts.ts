import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { listActiveJoinedProducts } from '@/lib/appwrite/repositories/products';

export async function getProducts(): Promise<Product[]> {
  const rows = await listActiveJoinedProducts();
  return rows.map(mapProductRow);
}
