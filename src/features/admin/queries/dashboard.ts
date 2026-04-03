import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface ProductsPerCategory { category: string; count: number; active: number }
export interface PriceDistribution { range: string; count: number }
export interface ColorDistribution { color: string; count: number; fill: string }
export interface FlowerTypeDistribution { type: string; count: number }
export interface InventoryStatus { active: number; inactive: number; featured: number; total: number }
export interface RecentActivityItem {
  name: string;
  type: 'product' | 'category';
  action: 'created' | 'updated';
  date: string;
}
export interface PriceRangeByCategory { category: string; min: number; max: number; avg: number }

export async function getProductsPerCategory(): Promise<ProductsPerCategory[]> {
  const supabase = await createClient();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('category_id, is_active');
  if (productsError) throw new Error(productsError.message);

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');
  if (categoriesError) throw new Error(categoriesError.message);

  const categoryMap = new Map<string, string>(
    (categories ?? []).map((c) => [c.id, c.name]),
  );

  const counts = new Map<string, { count: number; active: number }>();
  for (const product of products ?? []) {
    const existing = counts.get(product.category_id) ?? { count: 0, active: 0 };
    counts.set(product.category_id, {
      count: existing.count + 1,
      active: existing.active + (product.is_active ? 1 : 0),
    });
  }

  return Array.from(counts.entries())
    .map(([categoryId, { count, active }]) => ({
      category: categoryMap.get(categoryId) ?? categoryId,
      count,
      active,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getPriceDistribution(): Promise<PriceDistribution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('products').select('price');
  if (error) throw new Error(error.message);

  const buckets: Record<string, number> = {
    'S/0–50': 0,
    'S/50–100': 0,
    'S/100–200': 0,
    'S/200–500': 0,
    'S/500+': 0,
  };

  for (const { price } of data ?? []) {
    if (price < 50) buckets['S/0–50']++;
    else if (price < 100) buckets['S/50–100']++;
    else if (price < 200) buckets['S/100–200']++;
    else if (price < 500) buckets['S/200–500']++;
    else buckets['S/500+']++;
  }

  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

const COLOR_FILLS: Record<string, string> = {
  rojo: 'var(--color-flower-rojo)',
  rosa: 'var(--color-flower-rosa)',
  amarillo: 'var(--color-flower-amarillo)',
  blanco: 'var(--color-flower-blanco)',
  morado: 'var(--color-flower-morado)',
  naranja: 'var(--color-flower-naranja)',
  verde: 'var(--color-flower-verde)',
  mixto: 'var(--color-flower-mixto)',
};

export async function getColorDistribution(): Promise<ColorDistribution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('colors')
    .eq('is_active', true);
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const { colors } of data ?? []) {
    for (const color of colors) {
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([color, count]) => ({
    color,
    count,
    fill: COLOR_FILLS[color] ?? '#cccccc',
  }));
}

export async function getFlowerTypeDistribution(): Promise<FlowerTypeDistribution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('flower_types')
    .eq('is_active', true);
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const { flower_types } of data ?? []) {
    for (const type of flower_types) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
}

export async function getInventoryStatus(): Promise<InventoryStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('is_active, is_featured');
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  return {
    total: rows.length,
    active: rows.filter((p) => p.is_active).length,
    inactive: rows.filter((p) => !p.is_active).length,
    featured: rows.filter((p) => p.is_featured).length,
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

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('category_id, price');
  if (productsError) throw new Error(productsError.message);

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');
  if (categoriesError) throw new Error(categoriesError.message);

  const categoryMap = new Map<string, string>(
    (categories ?? []).map((c) => [c.id, c.name]),
  );

  const pricesByCategory = new Map<string, number[]>();
  for (const { category_id, price } of products ?? []) {
    const existing = pricesByCategory.get(category_id) ?? [];
    existing.push(price);
    pricesByCategory.set(category_id, existing);
  }

  return Array.from(pricesByCategory.entries())
    .filter(([, prices]) => prices.length > 0)
    .map(([categoryId, prices]) => {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
      return {
        category: categoryMap.get(categoryId) ?? categoryId,
        min,
        max,
        avg,
      };
    });
}
