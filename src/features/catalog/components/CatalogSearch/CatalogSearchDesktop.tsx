'use client';

import type { Category } from '@/features/catalog/types';
import type { ProductFilters } from '@/features/catalog/utils/filterProducts';

import type { ColorDef } from './CatalogFilterColors';
import CatalogFilterSections from './CatalogFilterSections';
import CatalogSearchInput from './CatalogSearchInput';
import { FILTER_LABEL_CLS, PANEL_CARD_CLS } from './constants';

interface CatalogSearchDesktopProps {
  categories: Category[];
  productColors: ColorDef[];
  flowerTypes: string[];
  filters: ProductFilters;
  isFiltersActive: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onUpdateParam: (key: string, value: string) => void;
  onToggleColor: (color: string) => void;
  onToggleFlowerType: (type: string) => void;
  onClearAll: () => void;
}

export default function CatalogSearchDesktop({
  categories,
  productColors,
  flowerTypes,
  filters,
  isFiltersActive,
  inputValue,
  onInputChange,
  onUpdateParam,
  onToggleColor,
  onToggleFlowerType,
  onClearAll,
}: CatalogSearchDesktopProps) {
  return (
    <aside className="hidden md:block w-64 shrink-0 self-start sticky top-28">
      <div className={`${PANEL_CARD_CLS} p-5`}>
        <div className="mb-5">
          <CatalogSearchInput value={inputValue} onChange={onInputChange} />
        </div>

        <p className={`${FILTER_LABEL_CLS} mb-4`}>Filtros</p>

        <CatalogFilterSections
          categories={categories}
          productColors={productColors}
          flowerTypes={flowerTypes}
          filters={filters}
          isFiltersActive={isFiltersActive}
          onUpdateParam={onUpdateParam}
          onToggleColor={onToggleColor}
          onToggleFlowerType={onToggleFlowerType}
          onClearAll={onClearAll}
        />
      </div>
    </aside>
  );
}
