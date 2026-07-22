'use client';

import type { Category } from '@/features/catalog/types';
import type { ProductFilters } from '@/features/catalog/utils/filterProducts';

import CatalogFilterCategory from './CatalogFilterCategory';
import CatalogFilterColors, { type ColorDef } from './CatalogFilterColors';
import CatalogFilterFlowers from './CatalogFilterFlowers';
import CatalogFilterPrice from './CatalogFilterPrice';

interface CatalogFilterSectionsProps {
  categories: Category[];
  productColors: ColorDef[];
  flowerTypes: string[];
  filters: ProductFilters;
  isFiltersActive: boolean;
  onUpdateParam: (key: string, value: string) => void;
  onToggleColor: (color: string) => void;
  onToggleFlowerType: (type: string) => void;
  onClearAll: () => void;
}

export default function CatalogFilterSections({
  categories,
  productColors,
  flowerTypes,
  filters,
  isFiltersActive,
  onUpdateParam,
  onToggleColor,
  onToggleFlowerType,
  onClearAll,
}: CatalogFilterSectionsProps) {
  return (
    <div className="space-y-5">
      <CatalogFilterPrice
        precioMin={filters.precioMin}
        precioMax={filters.precioMax}
        onChangeParam={onUpdateParam}
      />
      <CatalogFilterCategory
        categories={categories}
        selected={filters.categoria}
        onToggle={(slug) => onUpdateParam('categoria', slug)}
      />
      <CatalogFilterColors
        colors={productColors}
        selected={filters.colors}
        onToggle={onToggleColor}
      />
      <CatalogFilterFlowers
        flowerTypes={flowerTypes}
        selected={filters.flowerTypes}
        onToggle={onToggleFlowerType}
      />
      {isFiltersActive && (
        <button
          type="button"
          onClick={onClearAll}
          className="w-full py-2 rounded-lg font-body text-xs font-medium transition-all border border-(--color-border) text-(--color-muted)"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
