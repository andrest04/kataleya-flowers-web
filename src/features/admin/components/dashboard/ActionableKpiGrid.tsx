'use client';

import Link from 'next/link';
import type { ActionableKpis } from '@/features/admin/queries/dashboard';
import { getAdminCategoryFilterHref, getAdminProductFilterHref } from '@/features/admin/utils/adminFilters';

interface Props {
  data: ActionableKpis;
}

interface ActionableKpiCardProps {
  title: string;
  value: number;
  description: string;
  badge?: string;
  href?: string;
  ctaLabel?: string;
}

function ActionableKpiCard({
  title,
  value,
  description,
  badge,
  href,
  ctaLabel,
}: ActionableKpiCardProps) {
  return (
    <div
      className="rounded-xl p-5 space-y-3 flex flex-col"
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            {title}
          </p>
          <p className="text-3xl font-semibold mt-2" style={{ color: 'var(--color-primary)' }}>
            {value}
          </p>
        </div>
        {badge ? (
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: 'color-mix(in srgb, var(--color-secondary) 18%, var(--color-white))',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
        {description}
      </p>

      {href && ctaLabel ? (
        <Link
          href={href}
          className="mt-auto text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75"
          style={{ color: 'var(--color-primary)' }}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

export default function ActionableKpiGrid({ data }: Props) {
  const periodLabel = `Últimos ${data.periodDays} días`;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Oportunidades detectadas
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Señales concretas para priorizar mejoras del catálogo y destacados.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ActionableKpiCard
          title="Galerías incompletas"
          value={data.activeWithoutAdditionalImages}
          description="Productos activos sin imágenes adicionales para enriquecer la galería del detalle."
          href={getAdminProductFilterHref('missing-gallery')}
          ctaLabel="Ver productos"
        />
        <ActionableKpiCard
          title="Categorías vacías"
          value={data.categoriesWithoutActiveProducts}
          description="Categorías sin productos activos que hoy no están aportando al catálogo público."
          href={getAdminCategoryFilterHref('without-active-products')}
          ctaLabel="Revisar categorías"
        />
        <ActionableKpiCard
          title="Destacados sin vistas"
          value={data.featuredWithoutViews}
          description="Productos destacados que no recibieron vistas y conviene revisar en portada o catálogo."
          badge={periodLabel}
          href={getAdminProductFilterHref('featured-without-views', data.periodDays)}
          ctaLabel="Abrir listado"
        />
        <ActionableKpiCard
          title="Activos sin vistas"
          value={data.activeWithoutViews}
          description="Productos activos que no recibieron tráfico y podrían necesitar mejor exposición o naming."
          badge={periodLabel}
          href={getAdminProductFilterHref('active-without-views', data.periodDays)}
          ctaLabel="Ver productos"
        />
      </div>
    </section>
  );
}
