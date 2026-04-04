import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import {
  getCategoryIdsWithActiveProducts,
  getProductIdsWithViewsInRange,
} from '@/features/admin/queries/adminFilters';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface InventoryStatus { active: number; inactive: number; featured: number; total: number }
export interface RecentActivityItem {
  name: string;
  type: 'product' | 'category';
  action: 'created' | 'updated';
  date: string;
}
export interface ActionableKpis {
  activeWithoutAdditionalImages: number;
  categoriesWithoutActiveProducts: number;
  featuredWithoutViews: number;
  activeWithoutViews: number;
  periodDays: number;
}

export async function getInventoryStatus(): Promise<InventoryStatus> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_inventory_status').single();

  if (error) throw new Error(error.message);

  return {
    active: data.active,
    inactive: data.inactive,
    featured: data.featured,
    total: data.total,
  };
}

export async function getCategoryCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true });

  if (error) throw new Error(error.message);

  return count ?? 0;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const supabase = await createClient();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('name, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);
  if (productsError) throw new Error(productsError.message);

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('name, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);
  if (categoriesError) throw new Error(categoriesError.message);

  const toItem = (
    row: Pick<ProductRow | CategoryRow, 'name' | 'created_at' | 'updated_at'>,
    type: 'product' | 'category',
  ): RecentActivityItem => ({
    name: row.name,
    type,
    action: row.created_at === row.updated_at ? 'created' : 'updated',
    date: row.updated_at,
  });

  const merged = [
    ...(products ?? []).map((p) => toItem(p, 'product')),
    ...(categories ?? []).map((c) => toItem(c, 'category')),
  ];

  return merged.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
}

export async function getActionableKpis(days = 30): Promise<ActionableKpis> {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: categories, error: categoriesError },
    viewedProductIds,
    activeCategoryIds,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, category_id, images, is_active, is_featured'),
    supabase
      .from('categories')
      .select('id'),
    getProductIdsWithViewsInRange(days),
    getCategoryIdsWithActiveProducts(),
  ]);

  if (productsError) throw new Error(productsError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  const rows = products ?? [];
  const categoryRows = categories ?? [];

  let activeWithoutAdditionalImages = 0;
  let featuredWithoutViews = 0;
  let activeWithoutViews = 0;

  for (const product of rows) {
    const hasViews = viewedProductIds.has(product.id);

    if (product.is_active) {
      if (product.images.length === 0) {
        activeWithoutAdditionalImages++;
      }

      if (!hasViews) {
        activeWithoutViews++;
      }
    }

    if (product.is_featured && !hasViews) {
      featuredWithoutViews++;
    }
  }

  const categoriesWithoutActiveProducts = categoryRows.filter(
    (category) => !activeCategoryIds.has(category.id),
  ).length;

  return {
    activeWithoutAdditionalImages,
    categoriesWithoutActiveProducts,
    featuredWithoutViews,
    activeWithoutViews,
    periodDays: days,
  };
}
