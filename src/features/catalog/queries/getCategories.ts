import type { Category } from '@/features/catalog/types';
import type { CategoryRepoRow } from '@/lib/appwrite/repositories/categories';
import {
  listActiveCategories,
  listCategoryPriceFrom,
} from '@/lib/appwrite/repositories/categories';

function mapCategoryRow(
  row: CategoryRepoRow,
  priceFrom: number | undefined
): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    occasion: row.occasion ?? undefined,
    imageUrl: row.image_url ?? undefined,
    priceFrom,
    isFeatured: row.is_featured,
  };
}

export async function getCategories(): Promise<Category[]> {
  const [rows, priceFromMap] = await Promise.all([
    listActiveCategories(),
    listCategoryPriceFrom(),
  ]);
  return rows.map((row) => mapCategoryRow(row, priceFromMap.get(row.id)));
}
