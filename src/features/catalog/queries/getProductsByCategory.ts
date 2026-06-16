import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { listActiveJoinedProductsByCategorySlug } from '@/lib/appwrite/repositories/products';

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const rows = await listActiveJoinedProductsByCategorySlug(categorySlug);
  return rows.map(mapProductRow);
}
