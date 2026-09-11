import type { Product } from '@/features/catalog/types';

export const MAX_BEST_SELLERS = 4;

export function pickBestSellers(
  products: Product[],
  max = MAX_BEST_SELLERS,
): Product[] {
  const featured = products.filter((product) => product.isFeatured);
  return (featured.length > 0 ? featured : products).slice(0, max);
}
