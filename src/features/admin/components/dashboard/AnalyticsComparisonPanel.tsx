import { LuArrowDownRight, LuArrowRight, LuArrowUpRight } from 'react-icons/lu';
import type {
  AnalyticsPeriodComparison,
  ComparativeMetric,
  ComparisonTrend,
} from '@/features/admin/queries/analytics';

interface Props {
  data: AnalyticsPeriodComparison;
}

interface ComparisonCardProps {
  label: string;
  description: string;
  metric: ComparativeMetric;
}

const TREND_STYLES: Record<ComparisonTrend, { color: string; background: string }> = {
  up: {
    color: 'var(--color-accent)',
    background: 'color-mix(in srgb, var(--color-accent) 10%, var(--color-white))',
  },
  down: {
    color: 'var(--color-primary)',
    background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-white))',
  },
  flat: {
    color: 'var(--color-muted)',
    background: 'color-mix(in srgb, var(--color-dark) 4%, var(--color-white))',
  },
};

function formatSignedValue(value: number, maximumFractionDigits = 0): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const absoluteValue = Math.abs(value);

  return `${sign}${absoluteValue.toLocaleString('es-PE', {
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  })}`;
}

function formatRate(value: number): string {
  return `${value.toLocaleString('es-PE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function getTrendIcon(trend: ComparisonTrend) {
  if (trend === 'up') return <LuArrowUpRight size={16} />;
  if (trend === 'down') return <LuArrowDownRight size={16} />;
  return <LuArrowRight size={16} />;
}

function getChangeCopy(metric: ComparativeMetric): string {
  if (metric.previous === 0) {
    return 'Sin base anterior';
  }

  if (metric.trend === 'flat') {
    return 'Sin cambios vs período anterior';
  }

  return `${formatSignedValue(metric.deltaAbsolute)} · ${formatSignedValue(metric.deltaPercentage, 1)}%`;
}

function ComparisonCard({ label, description, metric }: ComparisonCardProps) {
  const trendStyle = TREND_STYLES[metric.trend];

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: 'color-mix(in srgb, var(--color-dark) 3%, var(--color-white))',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          {label}
        </p>
        <p className="text-xs leading-5" style={{ color: 'var(--color-muted)' }}>
          {description}
        </p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold" style={{ color: 'var(--color-dark)' }}>
            {metric.current.toLocaleString('es-PE')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            Anterior: {metric.previous.toLocaleString('es-PE')}
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            color: trendStyle.color,
            background: trendStyle.background,
          }}
        >
          {getTrendIcon(metric.trend)}
          <span>{getChangeCopy(metric)}</span>
        </div>
      </div>
    </div>
  );
}

function RateComparisonItem({
  label,
  metric,
}: {
  label: string;
  metric: ComparativeMetric;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'color-mix(in srgb, var(--color-secondary) 8%, var(--color-white))',
        border: '1px solid color-mix(in srgb, var(--color-secondary) 16%, var(--color-border))',
      }}
    >
      <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--color-dark)' }}>
        {formatRate(metric.current)}
      </p>
      <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
        Anterior: {formatRate(metric.previous)}
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-dark)' }}>
        {getChangeCopy(metric)}
      </p>
    </div>
  );
}

export default function AnalyticsComparisonPanel({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
          Compara los últimos {data.periodDays} días contra los {data.periodDays} días
          inmediatamente anteriores. La ventana siempre mantiene el mismo tamaño para que la
          lectura sea consistente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ComparisonCard
          label="Vistas de producto"
          description="Aperturas de detalle registradas en el período actual."
          metric={data.productViews}
        />
        <ComparisonCard
          label="Clics en categorías"
          description="Clicks sobre categorías desde la grilla del catálogo."
          metric={data.categoryClicks}
        />
        <ComparisonCard
          label="Clics WhatsApp totales"
          description="Todos los clicks a WhatsApp, sin importar la fuente."
          metric={data.whatsAppClicks}
        />
        <ComparisonCard
          label="WhatsApp desde detalle de producto"
          description="Clicks con metadata.source = 'product_detail'."
          metric={data.productDetailWhatsAppClicks}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RateComparisonItem
          label="Tasa categoría → producto"
          metric={data.categoryToProductRate}
        />
        <RateComparisonItem
          label="Tasa producto → WhatsApp"
          metric={data.productToWhatsAppRate}
        />
      </div>
    </div>
  );
}
