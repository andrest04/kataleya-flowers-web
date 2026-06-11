import type { Category } from '@/features/catalog/types';
import { isAppwriteBackend } from '@/lib/appwrite/config';
import type { CategoryRepoRow } from '@/lib/appwrite/repositories/categories';
import {
  listActiveCategories,
  listCategoryPriceFrom,
} from '@/lib/appwrite/repositories/categories';
import { createStaticClient } from '@/lib/supabase/static';
import type { Database } from '@/lib/supabase/types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type PriceSummaryRow = Database['public']['Views']['category_price_summary']['Row'];

function mapCategoryRow(
  row: CategoryRow,
  priceSummary: PriceSummaryRow | undefined
): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    occasion: row.occasion ?? undefined,
    imageUrl: row.image_url ?? undefined,
    priceFrom: priceSummary?.price_from ?? undefined,
    isFeatured: row.is_featured,
  };
}

function mapAppwriteCategoryRow(
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
  if (isAppwriteBackend()) {
    const [rows, priceFromMap] = await Promise.all([
      listActiveCategories(),
      listCategoryPriceFrom(),
    ]);
    return rows.map((row) => mapAppwriteCategoryRow(row, priceFromMap.get(row.id)));
  }

  const supabase = createStaticClient();

  const [categoriesResult, priceSummaryResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase.from('category_price_summary').select('*'),
  ]);

  if (categoriesResult.error) {
    throw new Error(`getCategories failed: ${categoriesResult.error.message}`);
  }

  const categories = categoriesResult.data ?? [];
  const priceSummaries = priceSummaryResult.data ?? [];

  const priceSummaryMap = new Map<string, PriceSummaryRow>(
    priceSummaries
      .filter((s): s is PriceSummaryRow & { category_id: string } => s.category_id !== null)
      .map((s) => [s.category_id, s])
  );

  return categories.map((row) =>
    mapCategoryRow(row, priceSummaryMap.get(row.id))
  );
}
