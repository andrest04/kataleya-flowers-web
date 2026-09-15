import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { productsRepository } from '@/lib/database/repositories/products';

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const products = await productsRepository.listActiveJoinedByCategorySlug(categorySlug);
  return products.map(mapProductRow);
}
