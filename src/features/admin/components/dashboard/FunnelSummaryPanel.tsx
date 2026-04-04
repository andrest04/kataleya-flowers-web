import type { FunnelMetrics } from '@/features/admin/queries/analytics';

interface Props {
  data: FunnelMetrics;
}

interface FunnelStageProps {
  value: number;
  label: string;
  helper: string;
}

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

function FunnelStage({ value, label, helper }: FunnelStageProps) {
  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{
        background: 'color-mix(in srgb, var(--color-dark) 3%, var(--color-white))',
        border: '1px solid var(--color-border)',
      }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <p className="text-3xl font-semibold" style={{ color: 'var(--color-dark)' }}>
        {value}
      </p>
      <p className="text-xs leading-5" style={{ color: 'var(--color-muted)' }}>
        {helper}
      </p>
    </div>
  );
}

export default function FunnelSummaryPanel({ data }: Props) {
  const hasEvents =
    data.categoryClicks > 0 || data.productViews > 0 || data.productDetailWhatsAppClicks > 0;

  if (!hasEvents) {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
          Este funnel es una lectura operacional de eventos agregados. No representa atribución exacta por usuario.
        </p>
        <div
          className="rounded-xl p-5"
          style={{
            background: 'color-mix(in srgb, var(--color-dark) 3%, var(--color-white))',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            Todavía no hay señal suficiente para leer el funnel en este rango.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
            Probá ampliar el rango o esperá nuevos eventos del catálogo. El funnel se activa cuando ya hay clics en categorías, vistas de detalle de producto o clics a WhatsApp desde detalle de producto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
        Lectura operacional basada en eventos agregados del rango actual. Sirve para detectar fricción entre descubrimiento, vista y contacto, no para atribución exacta por usuario.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 items-stretch">
        <FunnelStage
          value={data.categoryClicks}
          label="1. Clics en categorías"
          helper="Entrada al catálogo desde la grilla de categorías."
        />

        <div className="hidden xl:flex items-center justify-center text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          {formatRate(data.categoryToProductRate)}
        </div>

        <FunnelStage
          value={data.productViews}
          label="2. Vistas de producto"
          helper="Aperturas de detalle de producto registradas."
        />

        <div className="hidden xl:flex items-center justify-center text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          {formatRate(data.productToWhatsAppRate)}
        </div>

        <FunnelStage
          value={data.productDetailWhatsAppClicks}
          label="3. WhatsApp desde detalle de producto"
          helper="Clicks con metadata.source = 'product_detail'."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-white))',
            border: '1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border))',
          }}
        >
          <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-muted)' }}>
            Tasa categoría → producto
          </p>
          <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--color-dark)' }}>
            {formatRate(data.categoryToProductRate)}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
            Vistas de producto sobre clics en categorías.
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 6%, var(--color-white))',
            border: '1px solid color-mix(in srgb, var(--color-accent) 14%, var(--color-border))',
          }}
        >
          <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-muted)' }}>
            Tasa producto → WhatsApp
          </p>
          <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--color-dark)' }}>
            {formatRate(data.productToWhatsAppRate)}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
            Clicks a WhatsApp desde detalle de producto sobre vistas de producto.
          </p>
        </div>
      </div>

      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        Total de clicks a WhatsApp en el rango: <span style={{ color: 'var(--color-dark)' }}>{data.whatsAppClicks}</span>. Solo los clicks desde detalle de producto entran en la tasa final del funnel.
      </p>
    </div>
  );
}
