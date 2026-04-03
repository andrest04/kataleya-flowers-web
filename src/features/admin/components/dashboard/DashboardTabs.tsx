'use client';

import { useState } from 'react';
import { LuPackage, LuLayoutGrid, LuStar, LuEye, LuMousePointerClick } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import type {
  ProductsPerCategory,
  PriceDistribution,
  ColorDistribution,
  FlowerTypeDistribution,
  InventoryStatus,
  RecentActivityItem,
} from '@/features/admin/queries/dashboard';
import type {
  AnalyticsSummary,
  TopProduct,
  TopCategory,
  WhatsAppBySource,
  DailyEventCount,
} from '@/features/admin/queries/analytics';
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

type Tab = 'resumen' | 'catalogo' | 'productos' | 'analiticas';

const TABS: { key: Tab; label: string }[] = [
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
  analyticsSummary: AnalyticsSummary;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  whatsAppBySource: WhatsAppBySource[];
  dailyEventCounts: DailyEventCount[];
}

export default function DashboardTabs({
  inventory,
  categoryCount,
  productsPerCategory,
  priceDistribution,
  colorDistribution,
  flowerTypeDistribution,
  recentActivity,
  analyticsSummary,
  topProducts,
  topCategories,
  whatsAppBySource,
  dailyEventCounts,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  return (
    <>
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
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
