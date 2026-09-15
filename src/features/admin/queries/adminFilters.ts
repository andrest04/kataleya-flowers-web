import { productsRepository } from '@/lib/database/repositories/products';

export async function getCategoryIdsWithActiveProducts(): Promise<Set<string>> {
  const products = await productsRepository.listActiveJoined();
  return new Set(products.map((product) => product.categoryId));
}
