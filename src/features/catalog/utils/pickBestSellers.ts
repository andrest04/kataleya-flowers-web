import type { CatalogCardProduct, Category, Product } from '@/features/catalog/types';
import { toCatalogCardProduct } from '@/features/catalog/utils/toCatalogCardProduct';

export const MAX_BEST_SELLERS = 4;

export const BEST_SELLERS_ALL_TAB = 'all';

export type BestSellersByTab = Record<string, CatalogCardProduct[]>;

export function pickBestSellers<T extends Pick<Product, 'isFeatured'>>(
  products: T[],
  max = MAX_BEST_SELLERS,
): T[] {
  const featured = products.filter((product) => product.isFeatured);
  return (featured.length > 0 ? featured : products).slice(0, max);
}

export function pickBestSellerCards(products: Product[]): CatalogCardProduct[] {
  return pickBestSellers(products).map(toCatalogCardProduct);
}

export function buildBestSellersByTab(
  products: Product[],
  tabCategories: Pick<Category, 'id'>[],
): BestSellersByTab {
  return Object.fromEntries([
    [BEST_SELLERS_ALL_TAB, pickBestSellerCards(products)],
    ...tabCategories.map(({ id }) => [
      id,
      pickBestSellerCards(products.filter((product) => product.categoryId === id)),
    ]),
  ]);
}
