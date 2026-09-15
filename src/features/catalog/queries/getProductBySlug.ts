import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { productsRepository } from '@/lib/database/repositories/products';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await productsRepository.findActiveJoinedBySlug(slug);
  return product ? mapProductRow(product) : null;
}
