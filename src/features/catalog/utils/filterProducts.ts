import type { Category,Product } from '@/features/catalog/types';

export const PRICE_MIN = 30;
export const PRICE_MAX = 800;

export interface ProductFilters {
  q: string;
  categoria: string; // category slug
  precioMin: number;
  precioMax: number;
  colors: string[];
  flowerTypes: string[];
}

export function getEffectivePrice(product: Product): number {
  if (product.priceTable?.length) {
    return Math.min(...product.priceTable.map((v) => v.price));
  }
  return product.price;
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return (
    filters.q.trim().length > 0 ||
    filters.categoria.length > 0 ||
    filters.precioMin > PRICE_MIN ||
    filters.precioMax < PRICE_MAX ||
    filters.colors.length > 0 ||
    filters.flowerTypes.length > 0
  );
}

export function filterProducts(
  allProducts: Product[],
  categories: Category[],
  filters: ProductFilters,
): Product[] {
  const q = filters.q.trim().toLowerCase();

  return allProducts.filter((product) => {
    // Text search
    if (q) {
      const searchable = [
        product.name,
        product.description,
        ...(product.includes ?? []),
        product.occasion ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Category filter
    if (filters.categoria) {
      const category = categories.find((c) => c.slug === filters.categoria);
      if (!category || product.categoryId !== category.id) return false;
    }

    // Price range
    const effectivePrice = getEffectivePrice(product);
    if (effectivePrice < filters.precioMin || effectivePrice > filters.precioMax) {
      return false;
    }

    // Color filter (OR: product must have at least one of the selected colors)
    if (filters.colors.length > 0) {
      const productColorSet = new Set(product.colors ?? []);
      const hasColor = filters.colors.some((c) => productColorSet.has(c));
      if (!hasColor) return false;
    }

    // Flower type filter (OR: product must have at least one of the selected types)
    if (filters.flowerTypes.length > 0) {
      const productTypeSet = new Set(product.flowerTypes ?? []);
      const hasType = filters.flowerTypes.some((t) => productTypeSet.has(t));
      if (!hasType) return false;
    }

    return true;
  });
}
