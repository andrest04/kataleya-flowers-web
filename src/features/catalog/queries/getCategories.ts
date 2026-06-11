import type { Category } from '@/features/catalog/types';
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

export async function getCategories(): Promise<Category[]> {
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
    // Dev-only fallback: allows working on the landing while Supabase is
    // paused/unreachable. Production MUST throw — a failed build or
    // revalidation keeps serving the last good page instead of caching
    // an empty catalog.
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `getCategories: Supabase unavailable, rendering without categories — ${categoriesResult.error.message}`
      );
      return [];
    }
    throw new Error(`getCategories failed: ${categoriesResult.error.message}`);
  }

  if (priceSummaryResult.error && process.env.NODE_ENV === 'development') {
    // Prices degrade gracefully (categories render without "Desde S/ …"),
    // but the failure should not be invisible while developing.
    console.warn(
      `getCategories: price summary unavailable — ${priceSummaryResult.error.message}`
    );
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
