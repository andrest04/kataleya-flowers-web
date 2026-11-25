import type { CatalogCollectionItem } from '@/features/catalog/components/CatalogCollection';
import type { CatalogSortOption } from '@/features/catalog/components/CatalogFilterSheet';
import type { Category, Product } from '@/features/catalog/types';
import { filterProducts, getEffectivePrice } from '@/features/catalog/utils/filterProducts';
import { toCatalogCardProduct } from '@/features/catalog/utils/toCatalogCardProduct';

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
    return categorySlug ? [{ product: toCatalogCardProduct(product), categorySlug }] : [];
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
  const slugByCategoryId = new Map(categories.map((category) => [category.id, category.slug]));
  const entries = products.map((product) => ({
    product,
    categorySlug: slugByCategoryId.get(product.categoryId) ?? '',
  }));
  return filterProducts(entries, {
    q: filters.q,
    categorySlugs: filters.categorySlugs,
    priceMin: filters.precioMin,
    priceMax: filters.precioMax,
    colors: filters.colors,
    flowerTypes: filters.flowerTypes,
  }).map(({ product }) => product);
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
