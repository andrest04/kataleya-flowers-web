export const ADMIN_PRODUCT_FILTER_VALUES = ['missing-gallery'] as const;

export type AdminProductFilter = (typeof ADMIN_PRODUCT_FILTER_VALUES)[number];

export const ADMIN_CATEGORY_FILTER_VALUES = ['without-active-products'] as const;

export type AdminCategoryFilter = (typeof ADMIN_CATEGORY_FILTER_VALUES)[number];

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function buildAdminProductsHref(params: {
  filter?: AdminProductFilter | null;
  categorySlug?: string | null;
}): string {
  const searchParams = new URLSearchParams();

  if (params.filter) {
    searchParams.set('filter', params.filter);
  }

  if (params.categorySlug) {
    searchParams.set('categoria', params.categorySlug);
  }

  const query = searchParams.toString();
  return query ? `/admin/productos?${query}` : '/admin/productos';
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

export function getAdminProductFilterMeta(filter: AdminProductFilter): ProductFilterMeta {
  switch (filter) {
    case 'missing-gallery':
      return {
        label: 'Galerías incompletas',
        description:
          'Mostrando productos activos sin imágenes adicionales para completar la galería del detalle.',
        emptyMessage:
          'No hay productos activos con galerías incompletas en este momento.',
      };
  }
}

export function getAdminCategoryFilterMeta(filter: AdminCategoryFilter): CategoryFilterMeta {
  switch (filter) {
    case 'without-active-products':
      return {
        label: 'Categorías vacías',
        description:
          'Mostrando categorías que hoy no tienen productos activos publicados en el catálogo.',
        emptyMessage: 'No hay categorías sin productos activos en este momento.',
      };
  }
}

export function getAdminProductFilterHref(filter: AdminProductFilter): string {
  return buildAdminProductsHref({ filter });
}

export function getAdminCategoryFilterHref(filter: AdminCategoryFilter): string {
  const params = new URLSearchParams({ filter });
  return `/admin/categorias?${params.toString()}`;
}
