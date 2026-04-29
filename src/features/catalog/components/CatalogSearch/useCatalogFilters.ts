'use client';

import { usePathname,useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  filterProducts,
  hasActiveFilters,
  PRICE_MAX,
  PRICE_MIN,
  type ProductFilters,
} from '@/features/catalog/utils/filterProducts';

import {
  parseCommaList,
  toggleValue,
  type UseCatalogFiltersArgs,
  type UseCatalogFiltersResult,
} from './filtersHelpers';

/**
 * Hook con toda la lógica de catalog search:
 * - parsea filtros desde URL search params
 * - mantiene un input local con debounce 300ms hacia la URL
 * - expone mutadores idempotentes para chips y facets
 * - memoiza el filtrado de productos
 *
 * Centraliza el "single source of truth" del catálogo client-side.
 */
export function useCatalogFilters({
  products,
  categories,
}: UseCatalogFiltersArgs): UseCatalogFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params
  const urlQ = searchParams.get('q') ?? '';
  const urlCategoria = searchParams.get('categoria') ?? '';
  const urlPrecioMin = Number(searchParams.get('precio_min')) || PRICE_MIN;
  const urlPrecioMax = Number(searchParams.get('precio_max')) || PRICE_MAX;
  const urlColors = useMemo(
    () => parseCommaList(searchParams.get('color')),
    [searchParams],
  );
  const urlTypes = useMemo(
    () => parseCommaList(searchParams.get('tipo')),
    [searchParams],
  );

  const filters = useMemo<ProductFilters>(
    () => ({
      q: urlQ,
      categoria: urlCategoria,
      precioMin: urlPrecioMin,
      precioMax: urlPrecioMax,
      colors: urlColors,
      flowerTypes: urlTypes,
    }),
    [urlQ, urlCategoria, urlPrecioMin, urlPrecioMax, urlColors, urlTypes],
  );

  // Local state for text input (debounced)
  const [inputValue, setInputValue] = useState(urlQ);

  // Sync local input if URL changes externally (back/forward, chip remove)
  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const updateListParam = useCallback(
    (key: string, list: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (list.length > 0) params.set(key, list.join(','));
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // Stable ref for debounce — avoids re-triggering when searchParams change
  const updateParamRef = useRef(updateParam);
  useEffect(() => {
    updateParamRef.current = updateParam;
  }, [updateParam]);

  // Debounce text → URL (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParamRef.current('q', inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const toggleColor = useCallback(
    (color: string) => updateListParam('color', toggleValue(urlColors, color)),
    [updateListParam, urlColors],
  );

  const toggleFlowerType = useCallback(
    (type: string) => updateListParam('tipo', toggleValue(urlTypes, type)),
    [updateListParam, urlTypes],
  );

  const clearAllFilters = useCallback(() => {
    router.replace(pathname);
    setInputValue('');
  }, [pathname, router]);

  const removeFilter = useCallback(
    (key: keyof ProductFilters, value?: string) => {
      switch (key) {
        case 'q':
          setInputValue('');
          updateParam('q', '');
          break;
        case 'categoria':
          updateParam('categoria', '');
          break;
        case 'precioMin':
          updateParam('precio_min', '');
          break;
        case 'precioMax':
          updateParam('precio_max', '');
          break;
        case 'colors':
          if (value) toggleColor(value);
          break;
        case 'flowerTypes':
          if (value) toggleFlowerType(value);
          break;
      }
    },
    [updateParam, toggleColor, toggleFlowerType],
  );

  const isFiltersActive = hasActiveFilters(filters);

  // TODO Fase 5: migrar filtros a server-side cuando el catálogo crezca
  // (hoy `getProducts` trae todos los productos al cliente).
  const filteredProducts = useMemo(
    () => (isFiltersActive ? filterProducts(products, categories, filters) : []),
    [isFiltersActive, products, categories, filters],
  );

  const activeFilterCount = useMemo(
    () =>
      [
        filters.q ? 1 : 0,
        filters.categoria ? 1 : 0,
        filters.precioMin > PRICE_MIN || filters.precioMax < PRICE_MAX ? 1 : 0,
        filters.colors.length,
        filters.flowerTypes.length,
      ].reduce((a, b) => a + b, 0),
    [filters],
  );

  return {
    filters,
    isFiltersActive,
    activeFilterCount,
    filteredProducts,
    inputValue,
    setInputValue,
    updateParam,
    updateListParam,
    toggleColor,
    toggleFlowerType,
    clearAllFilters,
    removeFilter,
  };
}
