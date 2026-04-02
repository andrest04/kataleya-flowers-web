import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { Category } from '@/features/catalog/types';

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
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const [categoriesResult, priceSummaryResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase.from('category_price_summary').select('*'),
  ]);

  if (categoriesResult.error) {
    throw new Error(`getCategories failed: ${categoriesResult.error.message}`);
  }

  const categories = categoriesResult.data ?? [];
  const priceSummaries = priceSummaryResult.data ?? [];

  const priceSummaryMap = new Map<string, PriceSummaryRow>(
    priceSummaries.map((s) => [s.category_id, s])
  );

  return categories.map((row) =>
    mapCategoryRow(row, priceSummaryMap.get(row.id))
  );
}
