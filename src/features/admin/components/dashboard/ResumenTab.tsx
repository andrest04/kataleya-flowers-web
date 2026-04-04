import { LuPackage, LuLayoutGrid, LuStar, LuEye, LuMousePointerClick } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import type { ActionableKpis, InventoryStatus, RecentActivityItem } from '@/features/admin/queries/dashboard';
import type { AnalyticsSummary } from '@/features/admin/queries/analytics';
import type { DashboardInsight } from '@/features/admin/queries/dashboardInsights';
import type { AnalyticsRange } from './analyticsRange';
import ChartCard from './ChartCard';
import InventoryDonut from './InventoryDonut';
import RecentActivityList from './RecentActivityList';
import ActionableKpiGrid from './ActionableKpiGrid';
import AutomaticInsightsPanel from './AutomaticInsightsPanel';

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

interface ResumenTabProps {
  inventory: InventoryStatus;
  categoryCount: number;
  analyticsSummary: AnalyticsSummary;
  automaticInsights: DashboardInsight[];
  actionableKpis: ActionableKpis;
  recentActivity: RecentActivityItem[];
  analyticsRange: AnalyticsRange;
}

export default function ResumenTab({
  inventory,
  categoryCount,
  analyticsSummary,
  automaticInsights,
  actionableKpis,
  recentActivity,
  analyticsRange,
}: ResumenTabProps) {
  return (
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
  );
}
