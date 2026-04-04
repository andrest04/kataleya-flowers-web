'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LuPackage, LuLayoutGrid, LuStar, LuEye, LuMousePointerClick } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import type {
  ActionableKpis,
  ProductsPerCategory,
  PriceDistribution,
  ColorDistribution,
  FlowerTypeDistribution,
  InventoryStatus,
  RecentActivityItem,
} from '@/features/admin/queries/dashboard';
import type {
  AnalyticsSummary,
  AnalyticsPeriodComparison,
  FunnelMetrics,
  TopProduct,
  TopCategory,
  WhatsAppBySource,
  DailyEventCount,
  ProductWhatsAppConversion,
} from '@/features/admin/queries/analytics';
import { MIN_FRICTION_PRODUCT_VIEWS } from './analyticsShared';
import ChartCard from './ChartCard';
import ProductsByCategoryChart from './ProductsByCategoryChart';
import PriceDistributionChart from './PriceDistributionChart';
import ColorPaletteChart from './ColorPaletteChart';
import FlowerTypeRadar from './FlowerTypeRadar';
import InventoryDonut from './InventoryDonut';
import RecentActivityList from './RecentActivityList';
import TopProductsChart from './TopProductsChart';
import TopCategoriesChart from './TopCategoriesChart';
import WhatsAppSourceChart from './WhatsAppSourceChart';
import DailyViewsChart from './DailyViewsChart';
import AnalyticsRangeSelector from './AnalyticsRangeSelector';
import ActionableKpiGrid from './ActionableKpiGrid';
import type { AnalyticsRange } from './analyticsRange';
import type { DashboardInsight } from '@/features/admin/queries/dashboardInsights';
import AutomaticInsightsPanel from './AutomaticInsightsPanel';
import FunnelSummaryPanel from './FunnelSummaryPanel';
import ProductConversionRanking from './ProductConversionRanking';
import AnalyticsComparisonPanel from './AnalyticsComparisonPanel';
import { DASHBOARD_TABS, type DashboardTab } from './dashboardTab';

const TABS: { key: DashboardTab; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'catalogo', label: 'Catálogo' },
  { key: 'productos', label: 'Productos' },
  { key: 'analiticas', label: 'Analíticas' },
];

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-6 flex items-center gap-4"
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-lg"
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          color: 'var(--color-primary)',
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-3xl font-semibold" style={{ color: 'var(--color-dark)' }}>
          {value}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

interface Props {
  inventory: InventoryStatus;
  categoryCount: number;
  productsPerCategory: ProductsPerCategory[];
  priceDistribution: PriceDistribution[];
  colorDistribution: ColorDistribution[];
  flowerTypeDistribution: FlowerTypeDistribution[];
  recentActivity: RecentActivityItem[];
  actionableKpis: ActionableKpis;
  automaticInsights: DashboardInsight[];
  analyticsSummary: AnalyticsSummary;
  analyticsComparison: AnalyticsPeriodComparison;
  funnelMetrics: FunnelMetrics;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  whatsAppBySource: WhatsAppBySource[];
  dailyEventCounts: DailyEventCount[];
  topProductConversions: ProductWhatsAppConversion[];
  lowProductConversions: ProductWhatsAppConversion[];
  analyticsRange: AnalyticsRange;
  initialActiveTab: DashboardTab;
  analyticsQueryString?: string;
}

export default function DashboardTabs({
  inventory,
  categoryCount,
  productsPerCategory,
  priceDistribution,
  colorDistribution,
  flowerTypeDistribution,
  recentActivity,
  actionableKpis,
  automaticInsights,
  analyticsSummary,
  analyticsComparison,
  funnelMetrics,
  topProducts,
  topCategories,
  whatsAppBySource,
  dailyEventCounts,
  topProductConversions,
  lowProductConversions,
  analyticsRange,
  initialActiveTab,
  analyticsQueryString,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialActiveTab);

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  const baseParams = useMemo(
    () => new URLSearchParams(analyticsQueryString),
    [analyticsQueryString],
  );

  const handleTabChange = (tab: DashboardTab) => {
    if (!DASHBOARD_TABS.includes(tab) || tab === activeTab) return;

    setActiveTab(tab);

    const nextParams = new URLSearchParams(baseParams);
    nextParams.set('tab', tab);

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  return (
    <>
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              disabled={isPending && !isActive}
              aria-pressed={isActive}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-wait"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-white)',
                    }
                  : {
                      background: 'var(--color-white)',
                      color: 'var(--color-dark)',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<LuPackage size={24} />}
              value={inventory.total}
              label={`Producto${inventory.total !== 1 ? 's' : ''} en total`}
            />
            <StatCard
              icon={<LuPackage size={24} />}
              value={inventory.active}
              label={`Producto${inventory.active !== 1 ? 's' : ''} activo${inventory.active !== 1 ? 's' : ''}`}
            />
            <StatCard
              icon={<LuLayoutGrid size={24} />}
              value={categoryCount}
              label={`Categoría${categoryCount !== 1 ? 's' : ''}`}
            />
            <StatCard
              icon={<LuStar size={24} />}
              value={inventory.featured}
              label={`Destacado${inventory.featured !== 1 ? 's' : ''}`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              icon={<LuEye size={24} />}
              value={analyticsSummary.totalProductViews}
              label={`Vista${analyticsSummary.totalProductViews !== 1 ? 's' : ''} (${analyticsSummary.periodDays}d)`}
            />
            <StatCard
              icon={<LuMousePointerClick size={24} />}
              value={analyticsSummary.totalCategoryClicks}
              label={`Clic${analyticsSummary.totalCategoryClicks !== 1 ? 's' : ''} categoría (${analyticsSummary.periodDays}d)`}
            />
            <StatCard
              icon={<FaWhatsapp size={24} />}
              value={analyticsSummary.totalWhatsAppClicks}
              label={`Clic${analyticsSummary.totalWhatsAppClicks !== 1 ? 's' : ''} WhatsApp (${analyticsSummary.periodDays}d)`}
            />
          </div>
          <AutomaticInsightsPanel insights={automaticInsights} analyticsRange={analyticsRange} />
          <ActionableKpiGrid data={actionableKpis} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Estado del inventario" description="Productos activos vs inactivos">
              <InventoryDonut data={inventory} />
            </ChartCard>
            <ChartCard title="Actividad reciente" description="Últimos cambios en productos y categorías">
              <RecentActivityList data={recentActivity} />
            </ChartCard>
          </div>
        </div>
      )}

      {activeTab === 'catalogo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Productos por categoría" description="Distribución total y activos">
            <ProductsByCategoryChart data={productsPerCategory} />
          </ChartCard>
          <ChartCard title="Distribución de precios" description="Rangos de precio en soles">
            <PriceDistributionChart data={priceDistribution} />
          </ChartCard>
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Paleta de colores" description="Colores más usados en arreglos activos">
            <ColorPaletteChart data={colorDistribution} />
          </ChartCard>
          <ChartCard title="Tipos de flor" description="Distribución por tipo de flor">
            <FlowerTypeRadar data={flowerTypeDistribution} />
          </ChartCard>
        </div>
      )}

      {activeTab === 'analiticas' && (
        <div className="space-y-6">
          <AnalyticsRangeSelector
            currentRange={analyticsRange}
            queryString={analyticsQueryString}
          />
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'color-mix(in srgb, var(--color-secondary) 8%, var(--color-white))',
              border: '1px solid color-mix(in srgb, var(--color-secondary) 16%, var(--color-border))',
              color: 'var(--color-dark)',
            }}
          >
            <span className="font-medium">Rango activo:</span> últimos {analyticsSummary.periodDays} días.
            <span style={{ color: 'var(--color-muted)' }}>
              {' '}
              Todas las métricas de esta vista son operacionales y se calculan con eventos agregados del catálogo público.
            </span>
          </div>
          <ChartCard
            title="Comparativa vs período anterior"
            description={`Últimos ${analyticsSummary.periodDays} días vs los ${analyticsSummary.periodDays} días inmediatamente anteriores`}
          >
            <AnalyticsComparisonPanel data={analyticsComparison} />
          </ChartCard>
          <ChartCard
            title="Funnel operativo de conversión"
            description={`Últimos ${analyticsSummary.periodDays} días — lectura basada en eventos agregados`}
          >
            <FunnelSummaryPanel data={funnelMetrics} />
          </ChartCard>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard
              title="Top productos por conversión a WhatsApp"
              description={`Últimos ${analyticsSummary.periodDays} días — solo clicks a WhatsApp desde detalle de producto`}
            >
              <ProductConversionRanking data={topProductConversions} variant="best" />
            </ChartCard>
            <ChartCard
              title="Productos con más fricción"
              description={`Últimos ${analyticsSummary.periodDays} días — solo productos con al menos ${MIN_FRICTION_PRODUCT_VIEWS} vistas y poco o nulo contacto desde detalle de producto`}
            >
              <ProductConversionRanking data={lowProductConversions} variant="friction" />
            </ChartCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top productos más vistos" description={`Últimos ${analyticsSummary.periodDays} días`}>
              <TopProductsChart data={topProducts} />
            </ChartCard>
            <ChartCard title="Clics en WhatsApp por fuente" description={`Últimos ${analyticsSummary.periodDays} días`}>
              <WhatsAppSourceChart data={whatsAppBySource} />
            </ChartCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top categorías" description={`Últimos ${analyticsSummary.periodDays} días`}>
              <TopCategoriesChart data={topCategories} />
            </ChartCard>
            <ChartCard title="Actividad diaria" description={`Vistas y clics — últimos ${analyticsSummary.periodDays} días`}>
              <DailyViewsChart data={dailyEventCounts} />
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
}
