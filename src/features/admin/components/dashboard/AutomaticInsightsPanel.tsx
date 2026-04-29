import Link from 'next/link';

import type { DashboardInsight, DashboardInsightTone } from '@/features/admin/queries/dashboardInsights';
import { getDashboardInsightActionHref } from '@/features/admin/utils/adminFilters';

interface Props {
  insights: DashboardInsight[];
  analyticsRange: number;
}

interface ToneConfig {
  badgeLabel: string;
  badgeStyle: React.CSSProperties;
  cardStyle: React.CSSProperties;
}

const TONE_STYLES: Record<DashboardInsightTone, ToneConfig> = {
  high: {
    badgeLabel: 'Prioridad alta',
    badgeStyle: {
      background: 'color-mix(in srgb, var(--color-primary) 14%, var(--color-white))',
      color: 'var(--color-primary)',
      border: '1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-white))',
    },
    cardStyle: {
      background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-white))',
      border: '1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border))',
    },
  },
  attention: {
    badgeLabel: 'Atención',
    badgeStyle: {
      background: 'color-mix(in srgb, var(--color-secondary) 18%, var(--color-white))',
      color: 'var(--color-dark)',
      border: '1px solid color-mix(in srgb, var(--color-secondary) 24%, var(--color-border))',
    },
    cardStyle: {
      background: 'color-mix(in srgb, var(--color-secondary) 7%, var(--color-white))',
      border: '1px solid color-mix(in srgb, var(--color-secondary) 20%, var(--color-border))',
    },
  },
  opportunity: {
    badgeLabel: 'Oportunidad',
    badgeStyle: {
      background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-white))',
      color: 'var(--color-accent)',
      border: '1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border))',
    },
    cardStyle: {
      background: 'color-mix(in srgb, var(--color-accent) 5%, var(--color-white))',
      border: '1px solid color-mix(in srgb, var(--color-accent) 18%, var(--color-border))',
    },
  },
};

export default function AutomaticInsightsPanel({ insights, analyticsRange }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Insights automáticos
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Alertas y oportunidades detectadas a partir del estado actual del catálogo y las analíticas.
        </p>
      </div>

      {insights.length === 0 ? (
        <div
          className="rounded-xl p-5"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 5%, var(--color-white))',
            border: '1px solid color-mix(in srgb, var(--color-accent) 18%, var(--color-border))',
          }}
        >
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-white))',
              color: 'var(--color-accent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border))',
            }}
          >
            Todo en orden
          </span>
          <p className="text-sm leading-6 mt-3" style={{ color: 'var(--color-dark)' }}>
            No se detectaron alertas clave en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const tone = TONE_STYLES[insight.tone];
            const actionHref = getDashboardInsightActionHref(insight.id, analyticsRange);

            return (
              <article
                key={insight.id}
                className="rounded-xl p-5 space-y-3"
                style={tone.cardStyle}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>
                    {insight.title}
                  </h3>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
                    style={tone.badgeStyle}
                  >
                    {tone.badgeLabel}
                  </span>
                </div>

                <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
                  {insight.message}
                </p>

                {actionHref ? (
                  <Link
                    href={actionHref}
                    className="inline-flex text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Revisar ahora
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
