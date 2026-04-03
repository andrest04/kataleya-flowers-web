import { createClient } from '@/lib/supabase/server';

export interface AnalyticsSummary {
  totalProductViews: number;
  totalCategoryClicks: number;
  totalWhatsAppClicks: number;
  periodDays: number;
}

export interface TopProduct {
  name: string;
  slug: string;
  views: number;
}

export interface TopCategory {
  name: string;
  slug: string;
  clicks: number;
}

export interface WhatsAppBySource {
  source: string;
  clicks: number;
  fill: string;
}

export interface DailyEventCount {
  date: string;
  views: number;
  clicks: number;
}

function getSinceDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const SOURCE_FILLS: Record<string, string> = {
  float: 'var(--chart-1)',
  hero: 'var(--chart-2)',
  contact: 'var(--chart-3)',
  product_detail: 'var(--chart-4)',
};

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type')
    .gte('created_at', since);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  return {
    totalProductViews: rows.filter((r) => r.event_type === 'product_view').length,
    totalCategoryClicks: rows.filter((r) => r.event_type === 'category_click').length,
    totalWhatsAppClicks: rows.filter((r) => r.event_type === 'whatsapp_click').length,
    periodDays: days,
  };
}

export async function getTopProducts(limit = 10, days = 30): Promise<TopProduct[]> {
  const supabase = await createClient();
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('entity_id, entity_slug')
    .eq('event_type', 'product_view')
    .gte('created_at', since);

  if (error) throw new Error(error.message);

  // Resolve product names from products table
  const slugs = new Set<string>();
  for (const row of data ?? []) {
    if (row.entity_slug) slugs.add(row.entity_slug);
  }

  const { data: products } = await supabase
    .from('products')
    .select('slug, name')
    .in('slug', Array.from(slugs));

  const nameMap = new Map<string, string>(
    (products ?? []).map((p) => [p.slug, p.name]),
  );

  const counts = new Map<string, { slug: string; views: number }>();
  for (const row of data ?? []) {
    if (!row.entity_slug) continue;
    const existing = counts.get(row.entity_slug) ?? { slug: row.entity_slug, views: 0 };
    existing.views++;
    counts.set(row.entity_slug, existing);
  }

  return Array.from(counts.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map(({ slug, views }) => ({
      name: nameMap.get(slug) ?? slug,
      slug,
      views,
    }));
}

export async function getTopCategories(limit = 10, days = 30): Promise<TopCategory[]> {
  const supabase = await createClient();
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('entity_id, entity_slug')
    .eq('event_type', 'category_click')
    .gte('created_at', since);

  if (error) throw new Error(error.message);

  // Resolve category names
  const slugs = new Set<string>();
  for (const row of data ?? []) {
    if (row.entity_slug) slugs.add(row.entity_slug);
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')
    .in('slug', Array.from(slugs));

  const nameMap = new Map<string, string>(
    (categories ?? []).map((c) => [c.slug, c.name]),
  );

  const counts = new Map<string, { slug: string; clicks: number }>();
  for (const row of data ?? []) {
    if (!row.entity_slug) continue;
    const existing = counts.get(row.entity_slug) ?? { slug: row.entity_slug, clicks: 0 };
    existing.clicks++;
    counts.set(row.entity_slug, existing);
  }

  return Array.from(counts.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit)
    .map(({ slug, clicks }) => ({
      name: nameMap.get(slug) ?? slug,
      slug,
      clicks,
    }));
}

export async function getWhatsAppBySource(days = 30): Promise<WhatsAppBySource[]> {
  const supabase = await createClient();
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('metadata')
    .eq('event_type', 'whatsapp_click')
    .gte('created_at', since);

  if (error) throw new Error(error.message);

  const SOURCE_LABELS: Record<string, string> = {
    float: 'Botón flotante',
    hero: 'Hero',
    contact: 'Contacto',
    product_detail: 'Producto',
  };

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const source = (row.metadata as Record<string, string> | null)?.source ?? 'unknown';
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([source, clicks]) => ({
    source: SOURCE_LABELS[source] ?? source,
    clicks,
    fill: SOURCE_FILLS[source] ?? 'var(--chart-5)',
  }));
}

export async function getDailyEventCounts(days = 30): Promise<DailyEventCount[]> {
  const supabase = await createClient();
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type, created_at')
    .gte('created_at', since);

  if (error) throw new Error(error.message);

  const dailyCounts = new Map<string, { views: number; clicks: number }>();

  // Initialize all days in range
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    dailyCounts.set(date, { views: 0, clicks: 0 });
  }

  for (const row of data ?? []) {
    const date = row.created_at.slice(0, 10);
    const existing = dailyCounts.get(date) ?? { views: 0, clicks: 0 };
    if (row.event_type === 'product_view') {
      existing.views++;
    } else {
      existing.clicks++;
    }
    dailyCounts.set(date, existing);
  }

  return Array.from(dailyCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      views: counts.views,
      clicks: counts.clicks,
    }));
}
