import { mapProductRow } from '@/features/catalog/queries/mappers';
import type { Product } from '@/features/catalog/types';
import { findActiveJoinedProductBySlug } from '@/lib/appwrite/repositories/products';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await findActiveJoinedProductBySlug(slug);
  return row ? mapProductRow(row) : null;
}
