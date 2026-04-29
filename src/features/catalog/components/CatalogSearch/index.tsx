'use client';

import type { ReactNode } from 'react';
import type { Category, Product } from '@/features/catalog/types';
import CatalogActiveChips from './CatalogActiveChips';
import CatalogResults from './CatalogResults';
import CatalogSearchDesktop from './CatalogSearchDesktop';
import CatalogSearchMobile from './CatalogSearchMobile';
import type { ColorDef } from './CatalogFilterColors';
import { useCatalogFilters } from './useCatalogFilters';

interface CatalogSearchProps {
  categories: Category[];
  products: Product[];
  flowerTypes: string[];
  productColors: ColorDef[];
  /**
   * Contenido a mostrar cuando NO hay filtros activos. Pensado para que el
   * Server Component renderice el grid de categorías una sola vez (evita
   * flicker entre el Suspense fallback y el cliente).
   */
  children?: ReactNode;
}

/**
 * Componente cliente principal del catálogo. Compone:
 * - sidebar desktop con input + filtros (sticky)
 * - panel mobile colapsable con input + filtros
 * - chips de filtros activos
 * - resultados o `children` (grid SSR de categorías) según si hay filtros
 */
export default function CatalogSearch({
  categories,
  products,
  flowerTypes,
  productColors,
  children,
}: CatalogSearchProps) {
  const f = useCatalogFilters({ products, categories });

  // Props compartidas entre los dos paneles (desktop / mobile).
  const panelProps = {
    categories,
    productColors,
    flowerTypes,
    filters: f.filters,
    isFiltersActive: f.isFiltersActive,
    inputValue: f.inputValue,
    onInputChange: f.setInputValue,
    onUpdateParam: f.updateParam,
    onToggleColor: f.toggleColor,
    onToggleFlowerType: f.toggleFlowerType,
    onClearAll: f.clearAllFilters,
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      <CatalogSearchDesktop {...panelProps} />

      <div className="flex-1 min-w-0">
        <CatalogSearchMobile
          {...panelProps}
          activeFilterCount={f.activeFilterCount}
        />

        {f.isFiltersActive ? (
          <>
            <CatalogActiveChips
              filters={f.filters}
              categories={categories}
              productColors={productColors}
              onRemove={f.removeFilter}
              onClear={f.clearAllFilters}
            />
            <CatalogResults
              products={f.filteredProducts}
              categories={categories}
              onClearAll={f.clearAllFilters}
            />
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
