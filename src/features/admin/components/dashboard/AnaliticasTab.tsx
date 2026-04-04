import type {
  AnalyticsSummary,
  TopProduct,
  TopCategory,
  WhatsAppBySource,
  ProductWhatsAppConversion,
} from '@/features/admin/queries/analytics';
import { MIN_FRICTION_PRODUCT_VIEWS } from './analyticsShared';
import type { AnalyticsRange } from './analyticsRange';
import { ANALYTICS_VIEWS, type AnalyticsView } from './analyticsView';
import ChartCard from './ChartCard';
import AnalyticsRangeSelector from './AnalyticsRangeSelector';
import ProductConversionRanking from './ProductConversionRanking';
import TopProductsChart from './TopProductsChart';
import TopCategoriesChart from './TopCategoriesChart';
import WhatsAppSourceChart from './WhatsAppSourceChart';

interface AnaliticasTabProps {
  analyticsSummary: AnalyticsSummary;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  whatsAppBySource: WhatsAppBySource[];
  topProductConversions: ProductWhatsAppConversion[];
  lowProductConversions: ProductWhatsAppConversion[];
  analyticsRange: AnalyticsRange;
  analyticsQueryString?: string;
  activeView: AnalyticsView;
  onViewChange: (view: AnalyticsView) => void;
  isPending: boolean;
}

export default function AnaliticasTab({
  analyticsSummary,
  topProducts,
  topCategories,
  whatsAppBySource,
  topProductConversions,
  lowProductConversions,
  analyticsRange,
  analyticsQueryString,
  activeView,
  onViewChange,
  isPending,
}: AnaliticasTabProps) {
  return (
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
          Métricas calculadas con eventos del catálogo público.
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ANALYTICS_VIEWS.map((view) => {
          const isActive = activeView === view;
          const label = view === 'conversion' ? 'Conversión' : 'Tráfico';

          return (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              disabled={isPending && !isActive}
              aria-pressed={isActive}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-wait"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--color-dark)',
                      color: 'var(--color-white)',
                    }
                  : {
                      background: 'var(--color-white)',
                      color: 'var(--color-dark)',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeView === 'conversion' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
              Conversión y acción
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Detectá rápido qué productos están convirtiendo mejor y cuáles necesitan revisión inmediata.
            </p>
          </div>

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
        </section>
      )}

      {activeView === 'trafico' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
              Detalle de tráfico
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Qué productos y categorías generan más interés, y de dónde vienen los contactos por WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top productos más vistos" description={`Últimos ${analyticsSummary.periodDays} días`}>
              <TopProductsChart data={topProducts} />
            </ChartCard>
            <ChartCard title="Clics en WhatsApp por fuente" description={`Últimos ${analyticsSummary.periodDays} días`}>
              <WhatsAppSourceChart data={whatsAppBySource} />
            </ChartCard>
          </div>
          <ChartCard title="Top categorías" description={`Últimos ${analyticsSummary.periodDays} días`}>
            <TopCategoriesChart data={topCategories} />
          </ChartCard>
        </section>
      )}
    </div>
  );
}
