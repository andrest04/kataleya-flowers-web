export const ADMIN_CATEGORY_FILTER_VALUES = ['without-active-products'] as const;
export type AdminCategoryFilter = (typeof ADMIN_CATEGORY_FILTER_VALUES)[number];

export const ADMIN_PRODUCT_STATUS_VALUES = ['active', 'inactive'] as const;
export const ADMIN_PRODUCT_GALLERY_VALUES = ['at-most-one-image'] as const;
export const ADMIN_PRODUCT_VIEW_VALUES = ['all', 'category', 'incomplete'] as const;

export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUS_VALUES)[number];
export type AdminProductGallery = (typeof ADMIN_PRODUCT_GALLERY_VALUES)[number];
export type AdminProductView = (typeof ADMIN_PRODUCT_VIEW_VALUES)[number];

export interface AdminProductQuery {
  search: string;
  categorySlug: string | null;
  status: AdminProductStatus | null;
  gallery: AdminProductGallery | null;
  view: AdminProductView;
  page: number;
  reorder: boolean;
}

type SearchParamValue = string | string[] | undefined;
type SearchParamRecord = Record<string, SearchParamValue>;

function getSingleValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseValue<T extends readonly string[]>(value: SearchParamValue, allowed: T): T[number] | null {
  const rawValue = getSingleValue(value);
  return allowed.find((item) => item === rawValue) ?? null;
}

function parsePage(value: SearchParamValue): number {
  const rawValue = getSingleValue(value);
  if (!rawValue || !/^\d+$/.test(rawValue)) return 1;
  const page = Number(rawValue);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function parseAdminProductQuery(searchParams: SearchParamRecord): AdminProductQuery {
  const view = parseValue(searchParams.vista, ADMIN_PRODUCT_VIEW_VALUES) ?? 'all';
  const gallery = view === 'incomplete'
    ? 'at-most-one-image'
    : parseValue(searchParams.galeria, ADMIN_PRODUCT_GALLERY_VALUES);
  const rawSearch = getSingleValue(searchParams.buscar)?.trim() ?? '';

  return {
    search: rawSearch.slice(0, 100),
    categorySlug: getSingleValue(searchParams.categoria) ?? null,
    status: parseValue(searchParams.estado, ADMIN_PRODUCT_STATUS_VALUES),
    gallery,
    view,
    page: parsePage(searchParams.page),
    reorder: getSingleValue(searchParams.orden) === 'completo',
  };
}

export function serializeAdminProductQuery(query: AdminProductQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set('buscar', query.search);
  if (query.categorySlug) params.set('categoria', query.categorySlug);
  if (query.status) params.set('estado', query.status);
  if (query.gallery) params.set('galeria', query.gallery);
  if (query.view !== 'all') params.set('vista', query.view);
  if (query.page > 1) params.set('page', String(query.page));
  if (query.reorder) params.set('orden', 'completo');
  const serialized = params.toString();
  return serialized ? `/admin/productos?${serialized}` : '/admin/productos';
}

export function updateAdminProductQuery(
  query: AdminProductQuery,
  update: Partial<AdminProductQuery>,
  resultChanging = true,
): AdminProductQuery {
  return {
    ...query,
    ...update,
    page: resultChanging ? 1 : update.page ?? query.page,
    reorder: resultChanging ? false : update.reorder ?? query.reorder,
  };
}

export function parseAdminCategoryFilter(value: SearchParamValue): AdminCategoryFilter | null {
  return parseValue(value, ADMIN_CATEGORY_FILTER_VALUES);
}

export function getAdminCategoryFilterMeta(filter: AdminCategoryFilter): { label: string; description: string; emptyMessage: string } {
  return {
    label: 'Categorías vacías',
    description: filter === 'without-active-products' ? 'Mostrando categorías que no tienen productos activos publicados en el catálogo.' : '',
    emptyMessage: 'No hay categorías sin productos activos en este momento.',
  };
}

export function getAdminProductFilterMeta(query: AdminProductQuery): string[] {
  const filters: string[] = [];
  if (query.search) filters.push(`Búsqueda: ${query.search}`);
  if (query.categorySlug) filters.push(`Categoría: ${query.categorySlug}`);
  if (query.status === 'active') filters.push('Estado: activos');
  if (query.status === 'inactive') filters.push('Estado: inactivos');
  if (query.gallery === 'at-most-one-image') filters.push('Galería: máximo una imagen');
  return filters;
}
