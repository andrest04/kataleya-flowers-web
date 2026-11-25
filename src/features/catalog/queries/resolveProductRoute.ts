import { getCategories } from '@/features/catalog/queries/getCategories';
import { getProductBySlug } from '@/features/catalog/queries/getProductBySlug';
import type { Category, Product } from '@/features/catalog/types';

const CATALOG_SEGMENT_PATTERN = /^[a-z0-9-]{1,120}$/;

export interface ProductRoute {
  category: Category;
  product: Product;
}

export async function resolveProductRoute(
  categorySlug: string,
  productSlug: string,
): Promise<ProductRoute | null> {
  if (!CATALOG_SEGMENT_PATTERN.test(categorySlug) || !CATALOG_SEGMENT_PATTERN.test(productSlug)) {
    return null;
  }

  const categories = await getCategories();
  const category = categories.find((candidate) => candidate.slug === categorySlug);
  if (!category) return null;

  const product = await getProductBySlug(productSlug);
  if (!product || product.categoryId !== category.id) return null;

  return { category, product };
}
