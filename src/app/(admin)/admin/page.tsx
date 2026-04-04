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
import {
  getAnalyticsPeriodComparison,
  getAnalyticsSummary,
  getFunnelMetrics,
  getLowProductWhatsAppConversions,
  getZeroWhatsAppProductInsightSummary,
  getTopProducts,
  getTopCategories,
  getWhatsAppBySource,
  getDailyEventCounts,
  getTopProductWhatsAppConversions,
} from '@/features/admin/queries/analytics';
import { getDashboardInsights } from '@/features/admin/queries/dashboardInsights';
import { DashboardTabs } from '@/features/admin/components/dashboard';
import { parseAnalyticsRange } from '@/features/admin/components/dashboard/analyticsRange';
import { parseDashboardTab } from '@/features/admin/components/dashboard/dashboardTab';
import { Button } from '@/components/ui';

interface AdminDashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const analyticsRange = parseAnalyticsRange(resolvedSearchParams.range);
  const activeTab = parseDashboardTab(resolvedSearchParams.tab);
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

  const [
    productsPerCategory,
    priceDistribution,
    colorDistribution,
    flowerTypeDistribution,
    inventory,
    recentActivity,
    actionableKpis,
    analyticsSummary,
    analyticsComparison,
    funnelMetrics,
    topProducts,
    topCategories,
    whatsAppBySource,
    dailyEventCounts,
    topProductConversions,
    lowProductConversions,
    zeroWhatsAppProductInsight,
  ] = await Promise.all([
    getProductsPerCategory(),
    getPriceDistribution(),
    getColorDistribution(),
    getFlowerTypeDistribution(),
    getInventoryStatus(),
    getRecentActivity(),
    getActionableKpis(analyticsRange),
    getAnalyticsSummary(analyticsRange),
    getAnalyticsPeriodComparison(analyticsRange),
    getFunnelMetrics(analyticsRange),
    getTopProducts(10, analyticsRange),
    getTopCategories(10, analyticsRange),
    getWhatsAppBySource(analyticsRange),
    getDailyEventCounts(analyticsRange),
    getTopProductWhatsAppConversions(5, analyticsRange),
    getLowProductWhatsAppConversions(5, analyticsRange),
    getZeroWhatsAppProductInsightSummary(analyticsRange),
  ]);
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
