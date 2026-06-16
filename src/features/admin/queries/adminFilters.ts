import { listActiveJoinedProducts } from '@/lib/appwrite/repositories/products';

export async function getCategoryIdsWithActiveProducts(): Promise<Set<string>> {
  const rows = await listActiveJoinedProducts();
  return new Set(rows.map((row) => row.category_id));
}
