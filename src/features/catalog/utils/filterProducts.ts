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

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function toSearchVariants(q: string): string[] {
  const phrase = normalizeText(q).trim().replace(/\s+/g, ' ');
  if (!phrase) return [];
  const variants = [phrase];
  if (phrase.length > 3 && phrase.endsWith('s')) variants.push(phrase.slice(0, -1));
  if (phrase.length > 4 && phrase.endsWith('es')) variants.push(phrase.slice(0, -2));
  return variants;
}

function matchesQuery(product: SearchableProduct, variants: string[]): boolean {
  const haystack = normalizeText(
    [product.name, product.description ?? '', ...(product.includes ?? []), product.occasion ?? ''].join(' '),
  );
  return variants.some((variant) => haystack.includes(variant));
}

function matchesAny(selected: Set<string>, values: string[] | undefined): boolean {
  return selected.size === 0 || (values ?? []).some((value) => selected.has(value));
}

export function filterProducts<T extends FilterableEntry>(
  entries: T[],
  filters: ProductFilters,
  except?: FilterFacet,
): T[] {
  const queryVariants = toSearchVariants(filters.q ?? '');
  const categorySlugs = new Set(filters.categorySlugs);
  const colors = new Set(filters.colors);
  const flowerTypes = new Set(filters.flowerTypes);

  return entries.filter(({ product, categorySlug }) => {
    if (queryVariants.length > 0 && !matchesQuery(product, queryVariants)) return false;
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
