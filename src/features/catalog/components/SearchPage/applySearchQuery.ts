import type { CatalogCollectionItem } from '@/features/catalog/components/CatalogCollection';
import type { CatalogSortOption } from '@/features/catalog/components/CatalogFilterSheet';
import type { Category, Product } from '@/features/catalog/types';
import { filterProducts, getEffectivePrice } from '@/features/catalog/utils/filterProducts';

export function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function parseList(value: string, allowedValues: Set<string>): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && allowedValues.has(item));
}

export function parsePrice(value: string, fallback: number, maximumPrice: number): number {
  if (!value.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximumPrice, Math.max(0, parsed)) : fallback;
}

export function parseSort(value: string): CatalogSortOption {
  if (value === 'price-asc' || value === 'price-desc' || value === 'name-asc') {
    return value;
  }
  return 'featured';
}

export function toCollectionItems(
  products: Product[],
  slugByCategoryId: Map<string, string>,
): CatalogCollectionItem[] {
  return products.flatMap((product) => {
    const categorySlug = slugByCategoryId.get(product.categoryId);
    return categorySlug ? [{ product, categorySlug }] : [];
  });
}

export function applySearchFilters(
  products: Product[],
  categories: Category[],
  filters: {
    q: string;
    categorySlugs: string[];
    precioMin: number;
    precioMax: number;
    colors: string[];
    flowerTypes: string[];
  },
): Product[] {
  const filtered = filterProducts(products, categories, {
    q: filters.q,
    categoria: filters.categorySlugs.length === 1 ? filters.categorySlugs[0] : '',
    precioMin: filters.precioMin,
    precioMax: filters.precioMax,
    colors: filters.colors,
    flowerTypes: filters.flowerTypes,
  });

  if (filters.categorySlugs.length <= 1) return filtered;

  const selectedSlugs = new Set(filters.categorySlugs);
  const allowedIds = new Set(
    categories.reduce<string[]>((ids, category) => {
      if (selectedSlugs.has(category.slug)) ids.push(category.id);
      return ids;
    }, []),
  );
  return filtered.filter((product) => allowedIds.has(product.categoryId));
}

export function sortProducts(products: Product[], sort: CatalogSortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'featured':
      return copy.sort(
        (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)),
      );
    case 'price-asc':
      return copy.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case 'price-desc':
      return copy.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'es-PE'));
  }
}
