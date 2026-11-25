export interface CatalogFilters {
  category: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  flowerTypes: string[];
}

export interface CatalogColorFacet {
  name: string;
  label: string;
  hex: string | null;
}

export type CatalogSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
