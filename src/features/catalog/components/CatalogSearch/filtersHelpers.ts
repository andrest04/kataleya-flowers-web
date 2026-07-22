import type { Category, Product } from '@/features/catalog/types';
import type { ProductFilters } from '@/features/catalog/utils/filterProducts';

export function parseCommaList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export interface UseCatalogFiltersArgs {
  products: Product[];
  categories: Category[];
}

export interface UseCatalogFiltersResult {
  filters: ProductFilters;
  isFiltersActive: boolean;
  activeFilterCount: number;
  filteredProducts: Product[];

  inputValue: string;
  setInputValue: (value: string) => void;

  updateParam: (key: string, value: string) => void;
  updateListParam: (key: string, list: string[]) => void;
  toggleColor: (color: string) => void;
  toggleFlowerType: (type: string) => void;
  clearAllFilters: () => void;
  removeFilter: (key: keyof ProductFilters, value?: string) => void;
}
