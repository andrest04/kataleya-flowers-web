import type { DashboardInsight } from '@/features/admin/queries/dashboardInsights';

export const ADMIN_PRODUCT_FILTER_VALUES = [
  'missing-gallery',
  'featured-without-views',
  'active-without-views',
] as const;

export type AdminProductFilter = (typeof ADMIN_PRODUCT_FILTER_VALUES)[number];

export const ADMIN_CATEGORY_FILTER_VALUES = ['without-active-products'] as const;

export type AdminCategoryFilter = (typeof ADMIN_CATEGORY_FILTER_VALUES)[number];

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminProductFilter(
  value: string | string[] | undefined,
): AdminProductFilter | null {
  const rawValue = getSingleValue(value);

  return ADMIN_PRODUCT_FILTER_VALUES.find((filter) => filter === rawValue) ?? null;
}

export function parseAdminCategoryFilter(
  value: string | string[] | undefined,
): AdminCategoryFilter | null {
  const rawValue = getSingleValue(value);

  return ADMIN_CATEGORY_FILTER_VALUES.find((filter) => filter === rawValue) ?? null;
}

interface ProductFilterMeta {
  label: string;
  description: string;
  emptyMessage: string;
}

interface CategoryFilterMeta {
  label: string;
  description: string;
  emptyMessage: string;
}

export function getAdminProductFilterMeta(
  filter: AdminProductFilter,
  range: number,
): ProductFilterMeta {
  switch (filter) {
    case 'missing-gallery':
      return {
        label: 'Galerías incompletas',
        description:
          'Mostrando productos activos sin imágenes adicionales para completar la galería del detalle.',
        emptyMessage:
          'No hay productos activos con galerías incompletas en este momento.',
      };
    case 'featured-without-views':
      return {
        label: 'Destacados sin vistas',
        description: `Mostrando productos destacados que no recibieron vistas en los últimos ${range} días.`,
        emptyMessage:
          'No hay productos destacados sin vistas dentro del rango seleccionado.',
      };
    case 'active-without-views':
      return {
        label: 'Activos sin vistas',
        description: `Mostrando productos activos que no recibieron vistas en los últimos ${range} días.`,
        emptyMessage:
          'No hay productos activos sin vistas dentro del rango seleccionado.',
      };
  }
}

export function getAdminCategoryFilterMeta(
  filter: AdminCategoryFilter,
): CategoryFilterMeta {
  switch (filter) {
    case 'without-active-products':
      return {
        label: 'Categorías vacías',
        description:
          'Mostrando categorías que hoy no tienen productos activos publicados en el catálogo.',
        emptyMessage:
          'No hay categorías sin productos activos en este momento.',
      };
  }
}

export function getAdminProductFilterHref(
  filter: AdminProductFilter,
  range?: number,
): string {
  const params = new URLSearchParams({ filter });

  if (
    range !== undefined
    && (filter === 'featured-without-views' || filter === 'active-without-views')
  ) {
    params.set('range', String(range));
  }

  return `/admin/productos?${params.toString()}`;
}

export function getAdminCategoryFilterHref(filter: AdminCategoryFilter): string {
  const params = new URLSearchParams({ filter });
  return `/admin/categorias?${params.toString()}`;
}

export function getDashboardInsightActionHref(
  insightId: DashboardInsight['id'],
  range: number,
): string | null {
  switch (insightId) {
    case 'active-without-additional-images':
      return getAdminProductFilterHref('missing-gallery');
    case 'categories-without-active-products':
      return getAdminCategoryFilterHref('without-active-products');
    case 'featured-without-views':
      return getAdminProductFilterHref('featured-without-views', range);
    case 'active-without-views':
    case 'interest-without-contact':
      return getAdminProductFilterHref('active-without-views', range);
    case 'product-interest-without-whatsapp':
      return `/admin?tab=analiticas&range=${range}`;
    default:
      return null;
  }
}
