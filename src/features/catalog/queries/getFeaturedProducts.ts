import { getProducts } from '@/features/catalog/queries/getProducts';
import type { Product } from '@/features/catalog/types';

const MAX_FEATURED = 4;

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.isFeatured).slice(0, MAX_FEATURED);
}
