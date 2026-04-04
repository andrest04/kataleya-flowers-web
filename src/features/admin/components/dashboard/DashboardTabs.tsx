'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type {
  ActionableKpis,
  InventoryStatus,
  RecentActivityItem,
} from '@/features/admin/queries/dashboard';
import type {
  AnalyticsSummary,
  TopProduct,
  TopCategory,
  WhatsAppBySource,
  ProductWhatsAppConversion,
} from '@/features/admin/queries/analytics';
import type { AnalyticsRange } from './analyticsRange';
import type { AnalyticsView } from './analyticsView';
import { ANALYTICS_VIEWS } from './analyticsView';
import type { DashboardInsight } from '@/features/admin/queries/dashboardInsights';
import { DASHBOARD_TABS, type DashboardTab } from './dashboardTab';
import ResumenTab from './ResumenTab';
import AnaliticasTab from './AnaliticasTab';

const TABS: { key: DashboardTab; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'analiticas', label: 'Analíticas' },
];

interface Props {
  inventory: InventoryStatus;
  categoryCount: number;
  recentActivity: RecentActivityItem[];
  actionableKpis: ActionableKpis;
  automaticInsights: DashboardInsight[];
  analyticsSummary: AnalyticsSummary;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  whatsAppBySource: WhatsAppBySource[];
  topProductConversions: ProductWhatsAppConversion[];
  lowProductConversions: ProductWhatsAppConversion[];
  analyticsRange: AnalyticsRange;
  initialActiveTab: DashboardTab;
  initialAnalyticsView: AnalyticsView;
  analyticsQueryString?: string;
}

export default function DashboardTabs({
  inventory,
  categoryCount,
  recentActivity,
  actionableKpis,
  automaticInsights,
  analyticsSummary,
  topProducts,
  topCategories,
  whatsAppBySource,
  topProductConversions,
  lowProductConversions,
  analyticsRange,
  initialActiveTab,
  initialAnalyticsView,
  analyticsQueryString,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialActiveTab);
  const [activeAnalyticsView, setActiveAnalyticsView] = useState<AnalyticsView>(initialAnalyticsView);

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  useEffect(() => {
    setActiveAnalyticsView(initialAnalyticsView);
  }, [initialAnalyticsView]);

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

  const handleAnalyticsViewChange = (view: AnalyticsView) => {
    if (!ANALYTICS_VIEWS.includes(view) || view === activeAnalyticsView) return;

    setActiveAnalyticsView(view);

    const nextParams = new URLSearchParams(baseParams);
    nextParams.set('tab', 'analiticas');
    nextParams.set('analytics_view', view);

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
        <ResumenTab
          inventory={inventory}
          categoryCount={categoryCount}
          analyticsSummary={analyticsSummary}
          automaticInsights={automaticInsights}
          actionableKpis={actionableKpis}
          recentActivity={recentActivity}
          analyticsRange={analyticsRange}
        />
      )}

      {activeTab === 'analiticas' && (
        <AnaliticasTab
          analyticsSummary={analyticsSummary}
          topProducts={topProducts}
          topCategories={topCategories}
          whatsAppBySource={whatsAppBySource}
          topProductConversions={topProductConversions}
          lowProductConversions={lowProductConversions}
          analyticsRange={analyticsRange}
          analyticsQueryString={analyticsQueryString}
          activeView={activeAnalyticsView}
          onViewChange={handleAnalyticsViewChange}
          isPending={isPending}
        />
      )}
    </>
  );
}
