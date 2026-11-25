import { getCategories } from '@/features/catalog/queries/getCategories';
import { getProducts } from '@/features/catalog/queries/getProducts';
import type { Product } from '@/features/catalog/types';

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((candidate) => candidate.slug === categorySlug);
  if (!category) return [];
  return products.filter((product) => product.categoryId === category.id);
}
