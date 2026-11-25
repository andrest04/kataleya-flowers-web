import type { CatalogCardProduct, Product } from '@/features/catalog/types';

export type SearchableProduct = CatalogCardProduct &
  Partial<Pick<Product, 'description' | 'includes' | 'occasion'>>;

export interface FilterableEntry {
  product: SearchableProduct;
  categorySlug: string;
}

export interface ProductFilters {
  q?: string;
  categorySlugs: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  flowerTypes: string[];
}

export type FilterFacet = 'category' | 'price' | 'colors' | 'flowerTypes';

export function getEffectivePrice(product: Pick<Product, 'price' | 'priceTable'>): number {
  if (product.priceTable?.length) {
    return Math.min(...product.priceTable.map((v) => v.price));
  }
  return product.price;
}

function matchesQuery(product: SearchableProduct, q: string): boolean {
  return [product.name, product.description ?? '', ...(product.includes ?? []), product.occasion ?? '']
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function matchesAny(selected: Set<string>, values: string[] | undefined): boolean {
  return selected.size === 0 || (values ?? []).some((value) => selected.has(value));
}

export function filterProducts<T extends FilterableEntry>(
  entries: T[],
  filters: ProductFilters,
  except?: FilterFacet,
): T[] {
  const q = filters.q?.trim().toLowerCase() ?? '';
  const categorySlugs = new Set(filters.categorySlugs);
  const colors = new Set(filters.colors);
  const flowerTypes = new Set(filters.flowerTypes);

  return entries.filter(({ product, categorySlug }) => {
    if (q && !matchesQuery(product, q)) return false;
    if (except !== 'category' && categorySlugs.size > 0 && !categorySlugs.has(categorySlug)) {
      return false;
    }
    const price = getEffectivePrice(product);
    if (except !== 'price' && (price < filters.priceMin || price > filters.priceMax)) {
      return false;
    }
    if (except !== 'colors' && !matchesAny(colors, product.colors)) return false;
    if (except !== 'flowerTypes' && !matchesAny(flowerTypes, product.flowerTypes)) return false;
    return true;
  });
}
