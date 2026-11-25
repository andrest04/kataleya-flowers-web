import type { CatalogDensity } from '@/features/catalog/components/CatalogDensityToggle';
import type {
  CatalogFilters,
  CatalogSortOption,
} from '@/features/catalog/components/CatalogFilterSheet/types';

export interface CatalogQueryFacets {
  categorySlugs: ReadonlySet<string>;
  colors: ReadonlySet<string>;
  flowerTypes: ReadonlySet<string>;
  maximumPrice: number;
}

export interface CatalogQueryState {
  filters: CatalogFilters;
  sort: CatalogSortOption;
  density: CatalogDensity;
}

const SORT_OPTIONS: CatalogSortOption[] = ['featured', 'price-asc', 'price-desc', 'name-asc'];
const DENSITY_OPTIONS: CatalogDensity[] = [2, 3, 4];
const DEFAULT_SORT: CatalogSortOption = 'featured';
const DEFAULT_DENSITY: CatalogDensity = 3;
const MANAGED_PARAMS = [
  'categoria',
  'precio_min',
  'precio_max',
  'color',
  'tipo',
  'orden',
  'densidad',
];
const DESKTOP_SIZES: Record<CatalogDensity, string> = {
  2: '50vw',
  3: '33vw',
  4: '25vw',
};

function parseList(value: string | null, allowedValues: ReadonlySet<string>): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && allowedValues.has(item));
}

function parsePrice(value: string | null, fallback: number, maximumPrice: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximumPrice, Math.max(0, parsed)) : fallback;
}

function parseSort(value: string | null): CatalogSortOption {
  return SORT_OPTIONS.find((option) => option === value) ?? DEFAULT_SORT;
}

function parseDensity(value: string | null): CatalogDensity {
  const parsed = Number(value);
  return DENSITY_OPTIONS.find((option) => option === parsed) ?? DEFAULT_DENSITY;
}

export function parseCatalogQuery(search: string, facets: CatalogQueryFacets): CatalogQueryState {
  const params = new URLSearchParams(search);
  return {
    filters: {
      category: parseList(params.get('categoria'), facets.categorySlugs),
      priceMin: parsePrice(params.get('precio_min'), 0, facets.maximumPrice),
      priceMax: parsePrice(params.get('precio_max'), facets.maximumPrice, facets.maximumPrice),
      colors: parseList(params.get('color'), facets.colors),
      flowerTypes: parseList(params.get('tipo'), facets.flowerTypes),
    },
    sort: parseSort(params.get('orden')),
    density: parseDensity(params.get('densidad')),
  };
}

export function serializeCatalogQuery(
  { filters, sort, density }: CatalogQueryState,
  maximumPrice: number,
  currentSearch = '',
): string {
  const params = new URLSearchParams(currentSearch);
  MANAGED_PARAMS.forEach((key) => params.delete(key));
  if (filters.category.length) params.set('categoria', filters.category.join(','));
  if (filters.priceMin > 0) params.set('precio_min', String(filters.priceMin));
  if (filters.priceMax < maximumPrice) params.set('precio_max', String(filters.priceMax));
  if (filters.colors.length) params.set('color', filters.colors.join(','));
  if (filters.flowerTypes.length) params.set('tipo', filters.flowerTypes.join(','));
  if (sort !== DEFAULT_SORT) params.set('orden', sort);
  if (density !== DEFAULT_DENSITY) params.set('densidad', String(density));
  return params.toString();
}

export function catalogCardSizes(density: CatalogDensity): string {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${DESKTOP_SIZES[density]}`;
}
