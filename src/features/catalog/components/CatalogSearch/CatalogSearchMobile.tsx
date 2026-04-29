'use client';

import { ChevronDown, Filter } from 'lucide-react';
import { useId, useState } from 'react';
import type { Category } from '@/features/catalog/types';
import type { ProductFilters } from '@/features/catalog/utils/filterProducts';
import CatalogFilterSections from './CatalogFilterSections';
import CatalogSearchInput from './CatalogSearchInput';
import type { ColorDef } from './CatalogFilterColors';
import { PANEL_CARD_CLS } from './constants';

interface CatalogSearchMobileProps {
  categories: Category[];
  productColors: ColorDef[];
  flowerTypes: string[];
  filters: ProductFilters;
  isFiltersActive: boolean;
  activeFilterCount: number;
  inputValue: string;
  onInputChange: (value: string) => void;
  onUpdateParam: (key: string, value: string) => void;
  onToggleColor: (color: string) => void;
  onToggleFlowerType: (type: string) => void;
  onClearAll: () => void;
}

/** Panel mobile (<md): input + toggle colapsable de filtros. */
export default function CatalogSearchMobile({
  categories,
  productColors,
  flowerTypes,
  filters,
  isFiltersActive,
  activeFilterCount,
  inputValue,
  onInputChange,
  onUpdateParam,
  onToggleColor,
  onToggleFlowerType,
  onClearAll,
}: CatalogSearchMobileProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={`md:hidden ${PANEL_CARD_CLS} p-4 mb-4`}>
      <div className="mb-3">
        <CatalogSearchInput
          value={inputValue}
          onChange={onInputChange}
          placeholder="Buscar ramos, girasoles, orquídeas..."
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex items-center gap-2 font-body text-sm font-medium transition-colors text-(--color-dark)"
      >
        <Filter className="w-4 h-4" aria-hidden="true" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-(--color-primary) text-(--color-white)">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="mt-4 pt-4 border-t border-(--color-border)"
        >
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
      )}
    </div>
  );
}
