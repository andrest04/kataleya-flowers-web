import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import {
  getCategoryIdsWithActiveProducts,
  getProductIdsWithViewsInRange,
} from '@/features/admin/queries/adminFilters';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface ProductsPerCategory { category: string; count: number; active: number }
export interface PriceDistribution { range: string; count: number }
export interface ColorDistribution { colorName: string; count: number; fill: string }
export interface FlowerTypeDistribution { type: string; count: number }
export interface InventoryStatus { active: number; inactive: number; featured: number; total: number }
export interface RecentActivityItem {
  name: string;
  type: 'product' | 'category';
  action: 'created' | 'updated';
  date: string;
}
export interface PriceRangeByCategory { category: string; min: number; max: number; avg: number }
export interface ActionableKpis {
  activeWithoutAdditionalImages: number;
  categoriesWithoutActiveProducts: number;
  featuredWithoutViews: number;
  activeWithoutViews: number;
  periodDays: number;
}

const COLOR_FILLS: Record<string, string> = {
  rojo: 'var(--color-rojo)',
  rosa: 'var(--color-rosa)',
  amarillo: 'var(--color-amarillo)',
  blanco: 'var(--color-blanco)',
  morado: 'var(--color-morado)',
  naranja: 'var(--color-naranja)',
  verde: 'var(--color-verde)',
  mixto: 'var(--color-mixto)',
};

export async function getProductsPerCategory(): Promise<ProductsPerCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_products_per_category');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    category: row.category,
    count: row.count,
    active: row.active,
  }));
}

export async function getPriceDistribution(): Promise<PriceDistribution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_price_distribution');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    range: row.range,
    count: row.count,
  }));
}

export async function getColorDistribution(): Promise<ColorDistribution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_color_distribution');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    colorName: row.color_name,
    count: row.count,
    fill: COLOR_FILLS[row.color_name] ?? 'var(--color-muted)',
  }));
}

export async function getFlowerTypeDistribution(): Promise<FlowerTypeDistribution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_flower_type_distribution');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    type: row.flower_type,
    count: row.count,
  }));
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

export async function getPriceRangeByCategory(): Promise<PriceRangeByCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_price_range_by_category');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    category: row.category,
    min: row.min_price,
    max: row.max_price,
    avg: row.avg_price,
  }));
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
