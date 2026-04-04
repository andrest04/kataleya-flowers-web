import { LuPlus, LuExternalLink } from 'react-icons/lu';
import {
  getInventoryStatus,
  getCategoryCount,
  getRecentActivity,
  getActionableKpis,
} from '@/features/admin/queries/dashboard';
import type { InventoryStatus, ActionableKpis } from '@/features/admin/queries/dashboard';
import {
  getAnalyticsSummary,
  getProductWhatsAppConversions,
  deriveTopProductConversions,
  deriveLowProductConversions,
  deriveZeroWhatsAppInsight,
  getTopProducts,
  getTopCategories,
  getWhatsAppBySource,
} from '@/features/admin/queries/analytics';
import type { AnalyticsSummary } from '@/features/admin/queries/analytics';
import { getDashboardInsights } from '@/features/admin/queries/dashboardInsights';
import { DashboardTabs } from '@/features/admin/components/dashboard';
import { parseAnalyticsRange } from '@/features/admin/components/dashboard/analyticsRange';
import { parseAnalyticsView } from '@/features/admin/components/dashboard/analyticsView';
import { parseDashboardTab } from '@/features/admin/components/dashboard/dashboardTab';
import { Button } from '@/components/ui';

const EMPTY_INVENTORY: InventoryStatus = { active: 0, inactive: 0, featured: 0, total: 0 };
const EMPTY_KPIS: ActionableKpis = { activeWithoutAdditionalImages: 0, categoriesWithoutActiveProducts: 0, featuredWithoutViews: 0, activeWithoutViews: 0, periodDays: 0 };
const EMPTY_SUMMARY: AnalyticsSummary = { totalProductViews: 0, totalCategoryClicks: 0, totalWhatsAppClicks: 0, periodDays: 0 };

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

  const isResumen = activeTab === 'resumen';
  const isAnaliticas = activeTab === 'analiticas';
  const needsAnalytics = isResumen || isAnaliticas;

  const [
    inventory,
    categoryCount,
    recentActivity,
    actionableKpis,
    analyticsSummary,
    topProducts,
    topCategories,
    whatsAppBySource,
    productConversions,
  ] = await Promise.all([
    isResumen ? getInventoryStatus() : Promise.resolve(EMPTY_INVENTORY),
    isResumen ? getCategoryCount() : Promise.resolve(0),
    isResumen ? getRecentActivity() : Promise.resolve([]),
    isResumen ? getActionableKpis(analyticsRange) : Promise.resolve(EMPTY_KPIS),
    needsAnalytics ? getAnalyticsSummary(analyticsRange) : Promise.resolve(EMPTY_SUMMARY),
    isAnaliticas ? getTopProducts(10, analyticsRange) : Promise.resolve([]),
    isAnaliticas ? getTopCategories(10, analyticsRange) : Promise.resolve([]),
    isAnaliticas ? getWhatsAppBySource(analyticsRange) : Promise.resolve([]),
    needsAnalytics ? getProductWhatsAppConversions(analyticsRange) : Promise.resolve([]),
  ]);

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
        categoryCount={categoryCount}
        recentActivity={recentActivity}
        actionableKpis={actionableKpis}
        automaticInsights={automaticInsights}
        analyticsSummary={analyticsSummary}
        topProducts={topProducts}
        topCategories={topCategories}
        whatsAppBySource={whatsAppBySource}
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
