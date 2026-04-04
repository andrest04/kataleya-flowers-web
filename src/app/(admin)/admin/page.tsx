import { LuPlus, LuExternalLink } from 'react-icons/lu';
import {
  getProductsPerCategory,
  getPriceDistribution,
  getColorDistribution,
  getFlowerTypeDistribution,
  getInventoryStatus,
  getRecentActivity,
  getActionableKpis,
} from '@/features/admin/queries/dashboard';
import type {
  InventoryStatus,
  ActionableKpis,
} from '@/features/admin/queries/dashboard';
import {
  getAnalyticsPeriodComparison,
  getAnalyticsSummaryAndFunnel,
  getProductWhatsAppConversions,
  deriveTopProductConversions,
  deriveLowProductConversions,
  deriveZeroWhatsAppInsight,
  getTopProducts,
  getTopCategories,
  getWhatsAppBySource,
  getDailyEventCounts,
} from '@/features/admin/queries/analytics';
import type {
  AnalyticsSummaryAndFunnel,
  AnalyticsPeriodComparison,
} from '@/features/admin/queries/analytics';
import { getDashboardInsights } from '@/features/admin/queries/dashboardInsights';
import { DashboardTabs } from '@/features/admin/components/dashboard';
import { parseAnalyticsRange } from '@/features/admin/components/dashboard/analyticsRange';
import { parseAnalyticsView } from '@/features/admin/components/dashboard/analyticsView';
import { parseDashboardTab } from '@/features/admin/components/dashboard/dashboardTab';
import { Button } from '@/components/ui';

const ZERO_METRIC = { current: 0, previous: 0, deltaAbsolute: 0, deltaPercentage: 0, trend: 'flat' as const };
const EMPTY_INVENTORY: InventoryStatus = { active: 0, inactive: 0, featured: 0, total: 0 };
const EMPTY_KPIS: ActionableKpis = { activeWithoutAdditionalImages: 0, categoriesWithoutActiveProducts: 0, featuredWithoutViews: 0, activeWithoutViews: 0, periodDays: 0 };
const EMPTY_SUMMARY_AND_FUNNEL: AnalyticsSummaryAndFunnel = {
  summary: { totalProductViews: 0, totalCategoryClicks: 0, totalWhatsAppClicks: 0, periodDays: 0 },
  funnel: { categoryClicks: 0, productViews: 0, whatsAppClicks: 0, productDetailWhatsAppClicks: 0, categoryToProductRate: 0, productToWhatsAppRate: 0, periodDays: 0 },
};
const EMPTY_COMPARISON: AnalyticsPeriodComparison = {
  productViews: ZERO_METRIC, categoryClicks: ZERO_METRIC, whatsAppClicks: ZERO_METRIC,
  productDetailWhatsAppClicks: ZERO_METRIC, categoryToProductRate: ZERO_METRIC, productToWhatsAppRate: ZERO_METRIC, periodDays: 0,
};

interface AdminDashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const analyticsRange = parseAnalyticsRange(resolvedSearchParams.range);
  const activeTab = parseDashboardTab(resolvedSearchParams.tab);
  const analyticsView = parseAnalyticsView(resolvedSearchParams.analytics_view);
  const analyticsQueryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const entry of value) {
        analyticsQueryParams.append(key, entry);
      }
      continue;
    }

    analyticsQueryParams.set(key, value);
  }

  const analyticsQueryString = analyticsQueryParams.toString();

  // Conditional fetching: only query what the active tab needs
  const isResumen = activeTab === 'resumen';
  const isCatalogo = activeTab === 'catalogo';
  const isProductos = activeTab === 'productos';
  const isAnaliticas = activeTab === 'analiticas';
  const needsAnalytics = isResumen || isAnaliticas;

  const [
    productsPerCategory,
    priceDistribution,
    colorDistribution,
    flowerTypeDistribution,
    inventory,
    recentActivity,
    actionableKpis,
    summaryAndFunnel,
    analyticsComparison,
    topProducts,
    topCategories,
    whatsAppBySource,
    dailyEventCounts,
    productConversions,
  ] = await Promise.all([
    isResumen || isCatalogo ? getProductsPerCategory() : Promise.resolve([]),
    isCatalogo ? getPriceDistribution() : Promise.resolve([]),
    isProductos ? getColorDistribution() : Promise.resolve([]),
    isProductos ? getFlowerTypeDistribution() : Promise.resolve([]),
    isResumen ? getInventoryStatus() : Promise.resolve(EMPTY_INVENTORY),
    isResumen ? getRecentActivity() : Promise.resolve([]),
    isResumen ? getActionableKpis(analyticsRange) : Promise.resolve(EMPTY_KPIS),
    needsAnalytics ? getAnalyticsSummaryAndFunnel(analyticsRange) : Promise.resolve(EMPTY_SUMMARY_AND_FUNNEL),
    isAnaliticas ? getAnalyticsPeriodComparison(analyticsRange) : Promise.resolve(EMPTY_COMPARISON),
    isAnaliticas ? getTopProducts(10, analyticsRange) : Promise.resolve([]),
    isAnaliticas ? getTopCategories(10, analyticsRange) : Promise.resolve([]),
    isAnaliticas ? getWhatsAppBySource(analyticsRange) : Promise.resolve([]),
    isAnaliticas ? getDailyEventCounts(analyticsRange) : Promise.resolve([]),
    needsAnalytics ? getProductWhatsAppConversions(analyticsRange) : Promise.resolve([]),
  ]);

  const { summary: analyticsSummary, funnel: funnelMetrics } = summaryAndFunnel;
  const topProductConversions = deriveTopProductConversions(productConversions, 5);
  const lowProductConversions = deriveLowProductConversions(productConversions, 5);
  const zeroWhatsAppProductInsight = deriveZeroWhatsAppInsight(productConversions);

  const automaticInsights = getDashboardInsights({
    actionableKpis,
    analyticsSummary,
    zeroWhatsAppProductInsight,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-serif font-semibold"
          style={{ color: 'var(--color-dark)' }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Resumen general de tu tienda
        </p>
      </div>

      <DashboardTabs
        inventory={inventory}
        categoryCount={productsPerCategory.length}
        productsPerCategory={productsPerCategory}
        priceDistribution={priceDistribution}
        colorDistribution={colorDistribution}
        flowerTypeDistribution={flowerTypeDistribution}
        recentActivity={recentActivity}
        actionableKpis={actionableKpis}
        automaticInsights={automaticInsights}
        analyticsSummary={analyticsSummary}
        analyticsComparison={analyticsComparison}
        funnelMetrics={funnelMetrics}
        topProducts={topProducts}
        topCategories={topCategories}
        whatsAppBySource={whatsAppBySource}
        dailyEventCounts={dailyEventCounts}
        topProductConversions={topProductConversions}
        lowProductConversions={lowProductConversions}
        analyticsRange={analyticsRange}
        initialActiveTab={activeTab}
        initialAnalyticsView={analyticsView}
        analyticsQueryString={analyticsQueryString}
      />

      <div>
        <h2
          className="text-lg font-serif font-semibold mb-4"
          style={{ color: 'var(--color-dark)' }}
        >
          Accesos rápidos
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/productos/nuevo" variant="primary" size="sm">
            <LuPlus size={16} />
            Nuevo producto
          </Button>
          <Button href="/admin/categorias/nueva" variant="primary" size="sm">
            <LuPlus size={16} />
            Nueva categoría
          </Button>
          <Button href="/catalogo" variant="ghost" size="sm" external>
            <LuExternalLink size={16} />
            Ver catálogo público
          </Button>
        </div>
      </div>
    </div>
  );
}
