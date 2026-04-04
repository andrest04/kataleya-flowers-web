import { createClient } from '@/lib/supabase/server';
import { MIN_FRICTION_PRODUCT_VIEWS } from '@/features/admin/components/dashboard/analyticsShared';

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

export interface FunnelMetrics {
  categoryClicks: number;
  productViews: number;
  whatsAppClicks: number;
  productDetailWhatsAppClicks: number;
  categoryToProductRate: number;
  productToWhatsAppRate: number;
  periodDays: number;
}

export interface ProductWhatsAppConversion {
  id: string;
  name: string;
  slug: string;
  categorySlug: string | null;
  publicPath: string | null;
  views: number;
  whatsAppClicks: number;
  conversionRate: number;
}

export interface ZeroWhatsAppProductInsightSummary {
  productsWithoutClicks: number;
  minimumViews: number;
  totalViews: number;
}

export type ComparisonTrend = 'up' | 'down' | 'flat';

export interface ComparativeMetric {
  current: number;
  previous: number;
  deltaAbsolute: number;
  deltaPercentage: number;
  trend: ComparisonTrend;
}

export interface AnalyticsPeriodComparison {
  productViews: ComparativeMetric;
  categoryClicks: ComparativeMetric;
  whatsAppClicks: ComparativeMetric;
  productDetailWhatsAppClicks: ComparativeMetric;
  categoryToProductRate: ComparativeMetric;
  productToWhatsAppRate: ComparativeMetric;
  periodDays: number;
}

export interface AnalyticsSummaryAndFunnel {
  summary: AnalyticsSummary;
  funnel: FunnelMetrics;
}

// --- Internal types ---

interface EventTypeCount {
  event_type: string;
  source: string;
  count: number;
}

interface ProductCatalogInfo {
  id: string;
  name: string;
  categorySlug: string | null;
}

interface ProductCatalogRow {
  id: string;
  slug: string;
  name: string;
  categories: {
    slug: string;
  } | null;
}

// --- Helpers ---

const SOURCE_FILLS: Record<string, string> = {
  float: 'var(--chart-1)',
  hero: 'var(--chart-2)',
  contact: 'var(--chart-3)',
  product_detail: 'var(--chart-4)',
};

const SOURCE_LABELS: Record<string, string> = {
  float: 'Botón flotante',
  hero: 'Hero',
  contact: 'Contacto',
  product_detail: 'Producto',
};

function getSinceDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function calculateRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;

  return (numerator / denominator) * 100;
}

function getTrend(deltaAbsolute: number): ComparisonTrend {
  if (deltaAbsolute > 0) return 'up';
  if (deltaAbsolute < 0) return 'down';
  return 'flat';
}

function buildComparativeMetric(current: number, previous: number): ComparativeMetric {
  const deltaAbsolute = current - previous;
  const deltaPercentage = previous > 0 ? (deltaAbsolute / previous) * 100 : 0;

  return {
    current,
    previous,
    deltaAbsolute,
    deltaPercentage,
    trend: getTrend(deltaAbsolute),
  };
}

function deriveFunnelFromCounts(counts: EventTypeCount[], periodDays: number): FunnelMetrics {
  let categoryClicks = 0;
  let productViews = 0;
  let whatsAppClicks = 0;
  let productDetailWhatsAppClicks = 0;

  for (const row of counts) {
    if (row.event_type === 'category_click') {
      categoryClicks += row.count;
    } else if (row.event_type === 'product_view') {
      productViews += row.count;
    } else if (row.event_type === 'whatsapp_click') {
      whatsAppClicks += row.count;
      if (row.source === 'product_detail') {
        productDetailWhatsAppClicks += row.count;
      }
    }
  }

  return {
    categoryClicks,
    productViews,
    whatsAppClicks,
    productDetailWhatsAppClicks,
    categoryToProductRate: calculateRate(productViews, categoryClicks),
    productToWhatsAppRate: calculateRate(productDetailWhatsAppClicks, productViews),
    periodDays,
  };
}

async function fetchEventTypeCounts(since: string, until?: string): Promise<EventTypeCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_event_type_counts', {
    p_since: since,
    ...(until ? { p_until: until } : {}),
  });

  if (error) throw new Error(error.message);

  return data ?? [];
}

async function getProductCatalogMap(slugs: Iterable<string>): Promise<Map<string, ProductCatalogInfo>> {
  const productSlugs = Array.from(new Set(slugs));

  if (productSlugs.length === 0) {
    return new Map<string, ProductCatalogInfo>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, categories(slug)')
    .in('slug', productSlugs);

  if (error) throw new Error(error.message);

  return new Map<string, ProductCatalogInfo>(
    ((data ?? []) as ProductCatalogRow[]).map((product) => [
      product.slug,
      {
        id: product.id,
        name: product.name,
        categorySlug: product.categories?.slug ?? null,
      },
    ]),
  );
}

function getPublicProductPath(categorySlug: string | null, productSlug: string): string | null {
  if (!categorySlug) return null;

  return `/catalogo/${categorySlug}/${productSlug}`;
}

// --- Exported query functions ---

export async function getAnalyticsSummaryAndFunnel(days = 30): Promise<AnalyticsSummaryAndFunnel> {
  const counts = await fetchEventTypeCounts(getSinceDate(days));
  const funnel = deriveFunnelFromCounts(counts, days);

  return {
    summary: {
      totalProductViews: funnel.productViews,
      totalCategoryClicks: funnel.categoryClicks,
      totalWhatsAppClicks: funnel.whatsAppClicks,
      periodDays: days,
    },
    funnel,
  };
}

export async function getAnalyticsPeriodComparison(
  days = 30,
): Promise<AnalyticsPeriodComparison> {
  const currentSince = getSinceDate(days);
  const previousSince = getSinceDate(days * 2);

  const [currentCounts, previousCounts] = await Promise.all([
    fetchEventTypeCounts(currentSince),
    fetchEventTypeCounts(previousSince, currentSince),
  ]);

  const current = deriveFunnelFromCounts(currentCounts, days);
  const previous = deriveFunnelFromCounts(previousCounts, days);

  return {
    productViews: buildComparativeMetric(current.productViews, previous.productViews),
    categoryClicks: buildComparativeMetric(current.categoryClicks, previous.categoryClicks),
    whatsAppClicks: buildComparativeMetric(current.whatsAppClicks, previous.whatsAppClicks),
    productDetailWhatsAppClicks: buildComparativeMetric(
      current.productDetailWhatsAppClicks,
      previous.productDetailWhatsAppClicks,
    ),
    categoryToProductRate: buildComparativeMetric(
      current.categoryToProductRate,
      previous.categoryToProductRate,
    ),
    productToWhatsAppRate: buildComparativeMetric(
      current.productToWhatsAppRate,
      previous.productToWhatsAppRate,
    ),
    periodDays: days,
  };
}

export async function getTopProducts(limit = 10, days = 30): Promise<TopProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_top_entities', {
    p_event_type: 'product_view',
    p_since: getSinceDate(days),
    p_limit: limit,
  });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const productCatalogMap = await getProductCatalogMap(rows.map((r) => r.entity_slug));

  return rows.map(({ entity_slug, count }) => ({
    name: productCatalogMap.get(entity_slug)?.name ?? entity_slug,
    slug: entity_slug,
    views: count,
  }));
}

export async function getTopCategories(limit = 10, days = 30): Promise<TopCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_top_entities', {
    p_event_type: 'category_click',
    p_since: getSinceDate(days),
    p_limit: limit,
  });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const slugs = rows.map((r) => r.entity_slug);

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')
    .in('slug', slugs);

  const nameMap = new Map<string, string>(
    (categories ?? []).map((c) => [c.slug, c.name]),
  );

  return rows.map(({ entity_slug, count }) => ({
    name: nameMap.get(entity_slug) ?? entity_slug,
    slug: entity_slug,
    clicks: count,
  }));
}

export async function getWhatsAppBySource(days = 30): Promise<WhatsAppBySource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_whatsapp_source_counts', {
    p_since: getSinceDate(days),
  });

  if (error) throw new Error(error.message);

  return (data ?? []).map(({ source, count }) => ({
    source: SOURCE_LABELS[source] ?? source,
    clicks: count,
    fill: SOURCE_FILLS[source] ?? 'var(--chart-5)',
  }));
}

export async function getDailyEventCounts(days = 30): Promise<DailyEventCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_daily_event_counts', {
    p_since: getSinceDate(days),
  });

  if (error) throw new Error(error.message);

  // Build a map with all days initialized to zero
  const dailyCounts = new Map<string, { views: number; clicks: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    dailyCounts.set(date, { views: 0, clicks: 0 });
  }

  // Fill in actual counts from the RPC
  for (const row of data ?? []) {
    const dateStr = row.date.slice(0, 10);
    const existing = dailyCounts.get(dateStr) ?? { views: 0, clicks: 0 };
    if (row.event_type === 'product_view') {
      existing.views += row.count;
    } else {
      existing.clicks += row.count;
    }
    dailyCounts.set(dateStr, existing);
  }

  return Array.from(dailyCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      views: counts.views,
      clicks: counts.clicks,
    }));
}

export async function getProductWhatsAppConversions(days: number): Promise<ProductWhatsAppConversion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_product_conversion_metrics', {
    p_since: getSinceDate(days),
  });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const productCatalogMap = await getProductCatalogMap(rows.map((r) => r.entity_slug));

  return rows
    .map((row) => {
      const catalogProduct = productCatalogMap.get(row.entity_slug);

      if (!catalogProduct) return null;

      return {
        id: catalogProduct.id,
        name: catalogProduct.name,
        slug: row.entity_slug,
        categorySlug: catalogProduct.categorySlug,
        publicPath: getPublicProductPath(catalogProduct.categorySlug, row.entity_slug),
        views: row.views,
        whatsAppClicks: row.whatsapp_clicks,
        conversionRate: calculateRate(row.whatsapp_clicks, row.views),
      } satisfies ProductWhatsAppConversion;
    })
    .filter((product): product is ProductWhatsAppConversion => product !== null);
}

// --- Pure derivation functions (no I/O) ---

export function deriveTopProductConversions(
  products: ProductWhatsAppConversion[],
  limit = 5,
): ProductWhatsAppConversion[] {
  return [...products]
    .sort((a, b) => {
      const conversionDifference = b.conversionRate - a.conversionRate;

      if (conversionDifference !== 0) {
        return conversionDifference;
      }

      return b.views - a.views;
    })
    .slice(0, limit);
}

export function deriveLowProductConversions(
  products: ProductWhatsAppConversion[],
  limit = 5,
): ProductWhatsAppConversion[] {
  return [...products]
    .filter((product) => product.views >= MIN_FRICTION_PRODUCT_VIEWS)
    .sort((a, b) => {
      const conversionDifference = a.conversionRate - b.conversionRate;

      if (conversionDifference !== 0) {
        return conversionDifference;
      }

      return b.views - a.views;
    })
    .slice(0, limit);
}

export function deriveZeroWhatsAppInsight(
  products: ProductWhatsAppConversion[],
): ZeroWhatsAppProductInsightSummary {
  const productsWithoutClicks = products.filter(
    (product) => product.views >= MIN_FRICTION_PRODUCT_VIEWS && product.whatsAppClicks === 0,
  );

  return {
    productsWithoutClicks: productsWithoutClicks.length,
    minimumViews: MIN_FRICTION_PRODUCT_VIEWS,
    totalViews: productsWithoutClicks.reduce((sum, product) => sum + product.views, 0),
  };
}
