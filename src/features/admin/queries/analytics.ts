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

interface AnalyticsEventRow {
  created_at?: string;
  event_type: string;
  entity_slug: string | null;
  metadata: Record<string, string> | null;
}

interface AnalyticsWindow {
  start: string;
  end?: string;
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

interface ProductConversionMetrics {
  slug: string;
  views: number;
  whatsAppClicks: number;
}

function getSinceDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function getWindowStart(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

function getCurrentAnalyticsWindow(days: number): AnalyticsWindow {
  return {
    start: getSinceDate(days),
  };
}

function getComparisonAnalyticsWindows(days: number): {
  current: AnalyticsWindow;
  previous: AnalyticsWindow;
} {
  return {
    current: {
      start: getWindowStart(days),
    },
    previous: {
      start: getWindowStart(days * 2),
      end: getWindowStart(days),
    },
  };
}

const SOURCE_FILLS: Record<string, string> = {
  float: 'var(--chart-1)',
  hero: 'var(--chart-2)',
  contact: 'var(--chart-3)',
  product_detail: 'var(--chart-4)',
};

function calculateRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;

  return (numerator / denominator) * 100;
}

async function getAnalyticsEventsInRange(
  days: number,
  columns = 'event_type, entity_slug, metadata',
) {
  return getAnalyticsEventsByWindow(getCurrentAnalyticsWindow(days), columns);
}

async function getAnalyticsEventsByWindow(window: AnalyticsWindow, columns: string) {
  const supabase = await createClient();

  let query = supabase.from('analytics_events').select(columns).gte('created_at', window.start);

  if (window.end) {
    query = query.lt('created_at', window.end);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []) as unknown as AnalyticsEventRow[];
}

function deriveFunnelMetrics(rows: AnalyticsEventRow[], periodDays: number): FunnelMetrics {
  const categoryClicks = rows.filter((row) => row.event_type === 'category_click').length;
  const productViews = rows.filter((row) => row.event_type === 'product_view').length;
  const whatsAppClicks = rows.filter((row) => row.event_type === 'whatsapp_click').length;
  const productDetailWhatsAppClicks = rows.filter(
    (row) =>
      row.event_type === 'whatsapp_click' &&
      (row.metadata?.source ?? null) === 'product_detail',
  ).length;

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
  if (!categorySlug) {
    return null;
  }

  return `/catalogo/${categorySlug}/${productSlug}`;
}

function getProductDisplayName(
  productCatalogMap: Map<string, ProductCatalogInfo>,
  slug: string,
): string {
  return productCatalogMap.get(slug)?.name ?? slug;
}

function accumulateProductConversionMetrics(rows: AnalyticsEventRow[]): ProductConversionMetrics[] {
  const productMetrics = new Map<string, ProductConversionMetrics>();

  for (const row of rows) {
    if (!row.entity_slug) continue;

    if (row.event_type === 'product_view') {
      const existing = productMetrics.get(row.entity_slug) ?? {
        slug: row.entity_slug,
        views: 0,
        whatsAppClicks: 0,
      };
      existing.views += 1;
      productMetrics.set(row.entity_slug, existing);
      continue;
    }

    const source = row.metadata?.source ?? null;
    if (row.event_type === 'whatsapp_click' && source === 'product_detail') {
      const existing = productMetrics.get(row.entity_slug) ?? {
        slug: row.entity_slug,
        views: 0,
        whatsAppClicks: 0,
      };
      existing.whatsAppClicks += 1;
      productMetrics.set(row.entity_slug, existing);
    }
  }

  return Array.from(productMetrics.values()).filter((product) => product.views > 0);
}

async function getProductWhatsAppConversions(days: number): Promise<ProductWhatsAppConversion[]> {
  const rows = await getAnalyticsEventsInRange(days);
  const productMetrics = accumulateProductConversionMetrics(rows);
  const productCatalogMap = await getProductCatalogMap(productMetrics.map((product) => product.slug));

  return productMetrics
    .map((product) => {
      const catalogProduct = productCatalogMap.get(product.slug);

      if (!catalogProduct) {
        return null;
      }

      return {
        id: catalogProduct.id,
        name: catalogProduct.name,
        slug: product.slug,
        categorySlug: catalogProduct.categorySlug,
        publicPath: getPublicProductPath(catalogProduct.categorySlug, product.slug),
        views: product.views,
        whatsAppClicks: product.whatsAppClicks,
        conversionRate: calculateRate(product.whatsAppClicks, product.views),
      } satisfies ProductWhatsAppConversion;
    })
    .filter((product): product is ProductWhatsAppConversion => product !== null);
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const rows = await getAnalyticsEventsInRange(days, 'event_type');

  return {
    totalProductViews: rows.filter((r) => r.event_type === 'product_view').length,
    totalCategoryClicks: rows.filter((r) => r.event_type === 'category_click').length,
    totalWhatsAppClicks: rows.filter((r) => r.event_type === 'whatsapp_click').length,
    periodDays: days,
  };
}

export async function getFunnelMetrics(days = 30): Promise<FunnelMetrics> {
  const rows = await getAnalyticsEventsInRange(days);

  return deriveFunnelMetrics(rows, days);
}

export async function getAnalyticsPeriodComparison(
  days = 30,
): Promise<AnalyticsPeriodComparison> {
  const windows = getComparisonAnalyticsWindows(days);
  const [currentRows, previousRows] = await Promise.all([
    getAnalyticsEventsByWindow(windows.current, 'event_type, metadata'),
    getAnalyticsEventsByWindow(windows.previous, 'event_type, metadata'),
  ]);

  const current = deriveFunnelMetrics(currentRows, days);
  const previous = deriveFunnelMetrics(previousRows, days);

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
  const rows = await getAnalyticsEventsInRange(days, 'event_type, entity_slug');
  const data = rows.filter((row) => row.event_type === 'product_view');

  const slugs = new Set<string>();
  for (const row of data) {
    if (row.entity_slug) slugs.add(row.entity_slug);
  }

  const productCatalogMap = await getProductCatalogMap(slugs);

  const counts = new Map<string, { slug: string; views: number }>();
  for (const row of data) {
    if (!row.entity_slug) continue;
    const existing = counts.get(row.entity_slug) ?? { slug: row.entity_slug, views: 0 };
    existing.views++;
    counts.set(row.entity_slug, existing);
  }

  return Array.from(counts.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map(({ slug, views }) => ({
      name: getProductDisplayName(productCatalogMap, slug),
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
    const source = row.metadata?.source ?? 'unknown';
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

export async function getTopProductWhatsAppConversions(
  limit = 5,
  days = 30,
): Promise<ProductWhatsAppConversion[]> {
  const products = await getProductWhatsAppConversions(days);

  return products
    .sort((a, b) => {
      const conversionDifference = b.conversionRate - a.conversionRate;

      if (conversionDifference !== 0) {
        return conversionDifference;
      }

      return b.views - a.views;
    })
    .slice(0, limit)
    .map((product) => ({ ...product }));
}

export async function getLowProductWhatsAppConversions(
  limit = 5,
  days = 30,
): Promise<ProductWhatsAppConversion[]> {
  const products = await getProductWhatsAppConversions(days);

  return products
    .filter((product) => product.views >= MIN_FRICTION_PRODUCT_VIEWS)
    .sort((a, b) => {
      const conversionDifference = a.conversionRate - b.conversionRate;

      if (conversionDifference !== 0) {
        return conversionDifference;
      }

      return b.views - a.views;
    })
    .slice(0, limit)
    .map((product) => ({ ...product }));
}

export async function getZeroWhatsAppProductInsightSummary(
  days = 30,
): Promise<ZeroWhatsAppProductInsightSummary> {
  const products = await getProductWhatsAppConversions(days);
  const productsWithoutClicks = products.filter(
    (product) => product.views >= MIN_FRICTION_PRODUCT_VIEWS && product.whatsAppClicks === 0,
  );

  return {
    productsWithoutClicks: productsWithoutClicks.length,
    minimumViews: MIN_FRICTION_PRODUCT_VIEWS,
    totalViews: productsWithoutClicks.reduce((sum, product) => sum + product.views, 0),
  };
}
