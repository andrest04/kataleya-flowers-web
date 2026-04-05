'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Category, Product } from '@/features/catalog/types';
import {
  filterProducts,
  hasActiveFilters,
  PRICE_MIN,
  PRICE_MAX,
  type ProductFilters,
} from '@/features/catalog/utils/filterProducts';
import CategoryCard from '@/features/catalog/components/CategoryCard';
import ProductCardComponent from '@/features/catalog/components/ProductCard';
import FilterChip from '@/components/ui/FilterChip';

interface ColorDef {
  name: string;
  label: string;
  hex: string | null;
}

interface CatalogSearchProps {
  categories: Category[];
  products: Product[];
  flowerTypes: string[];
  productColors: ColorDef[];
}

function parseCommaList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// ─── Category Grid (shown when no filters active) ────────────────────────────

function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

// ─── Active filter chips ──────────────────────────────────────────────────────

function ActiveFilterChips({
  filters,
  categories,
  productColors,
  onRemove,
  onClear,
}: {
  filters: ProductFilters;
  productColors: ColorDef[];
  categories: Category[];
  onRemove: (key: keyof ProductFilters, value?: string) => void;
  onClear: () => void;
}) {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.q) {
    chips.push({ label: `"${filters.q}"`, onRemove: () => onRemove('q') });
  }
  if (filters.categoria) {
    const cat = categories.find((c) => c.slug === filters.categoria);
    chips.push({
      label: cat?.name ?? filters.categoria,
      onRemove: () => onRemove('categoria'),
    });
  }
  if (filters.precioMin > PRICE_MIN || filters.precioMax < PRICE_MAX) {
    chips.push({
      label: `S/ ${filters.precioMin} – S/ ${filters.precioMax}`,
      onRemove: () => {
        onRemove('precioMin');
        onRemove('precioMax');
      },
    });
  }
  filters.colors.forEach((c) => {
    const colorDef = productColors.find((pc) => pc.name === c);
    chips.push({
      label: colorDef?.label ?? c,
      onRemove: () => onRemove('colors', c),
    });
  });
  filters.flowerTypes.forEach((t) => {
    chips.push({
      label: t.charAt(0).toUpperCase() + t.slice(1),
      onRemove: () => onRemove('flowerTypes', t),
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip, i) => (
        <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
      ))}
      <button
        onClick={onClear}
        className="font-body text-xs underline transition-colors"
        style={{ color: 'var(--color-muted)' }}
      >
        Limpiar todo
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CatalogSearch({ categories, products, flowerTypes, productColors }: CatalogSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params
  const urlQ = searchParams.get('q') ?? '';
  const urlCategoria = searchParams.get('categoria') ?? '';
  const urlPrecioMin = Number(searchParams.get('precio_min')) || PRICE_MIN;
  const urlPrecioMax = Number(searchParams.get('precio_max')) || PRICE_MAX;
  const urlColors = parseCommaList(searchParams.get('color'));
  const urlTypes = parseCommaList(searchParams.get('tipo'));

  const filters: ProductFilters = {
    q: urlQ,
    categoria: urlCategoria,
    precioMin: urlPrecioMin,
    precioMax: urlPrecioMax,
    colors: urlColors,
    flowerTypes: urlTypes,
  };

  // Local state for text input (debounced)
  const [inputValue, setInputValue] = useState(urlQ);
  // Mobile filter panel toggle
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync local input if URL changes externally
  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  // Debounce text → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam('q', inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const updateListParam = useCallback(
    (key: string, list: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (list.length > 0) {
        params.set(key, list.join(','));
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const clearAllFilters = useCallback(() => {
    router.replace(pathname);
    setInputValue('');
  }, [pathname, router]);

  const handleRemoveFilter = useCallback(
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
          if (value) {
            updateListParam('color', toggleValue(urlColors, value));
          }
          break;
        case 'flowerTypes':
          if (value) {
            updateListParam('tipo', toggleValue(urlTypes, value));
          }
          break;
      }
    },
    [updateParam, updateListParam, urlColors, urlTypes],
  );

  const isFiltersActive = hasActiveFilters(filters);
  const filteredProducts = isFiltersActive
    ? filterProducts(products, categories, filters)
    : [];

  const activeFilterCount = [
    filters.q ? 1 : 0,
    filters.categoria ? 1 : 0,
    filters.precioMin > PRICE_MIN || filters.precioMax < PRICE_MAX ? 1 : 0,
    filters.colors.length,
    filters.flowerTypes.length,
  ].reduce((a, b) => a + b, 0);

  // ─── Shared filter sections (used in both sidebar and mobile panel) ──────────
  const filterSections = (
    <div className="space-y-5">
      {/* Price range */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>
          Precio
        </p>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs" style={{ color: 'var(--color-muted)' }}>S/</span>
          <input
            type="number"
            min={PRICE_MIN}
            max={urlPrecioMax}
            value={urlPrecioMin === PRICE_MIN ? '' : urlPrecioMin}
            onChange={(e) => {
              const val = Number(e.target.value) || PRICE_MIN;
              updateParam('precio_min', val > PRICE_MIN ? String(val) : '');
            }}
            placeholder={String(PRICE_MIN)}
            className="w-20 px-2 py-1.5 rounded font-body text-sm text-center outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-dark)',
            }}
          />
          <span className="font-body text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
          <span className="font-body text-xs" style={{ color: 'var(--color-muted)' }}>S/</span>
          <input
            type="number"
            min={urlPrecioMin}
            max={PRICE_MAX}
            value={urlPrecioMax === PRICE_MAX ? '' : urlPrecioMax}
            onChange={(e) => {
              const val = Number(e.target.value) || PRICE_MAX;
              updateParam('precio_max', val < PRICE_MAX ? String(val) : '');
            }}
            placeholder={String(PRICE_MAX)}
            className="w-20 px-2 py-1.5 rounded font-body text-sm text-center outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-dark)',
            }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>
          Categoría
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = urlCategoria === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('categoria', active ? '' : cat.slug)}
                className="px-3 py-1 rounded-full font-body text-xs font-medium transition-all"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-dark)',
                        border: '1px solid var(--color-border)',
                      }
                }
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color filter */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>
          Color
        </p>
        <div className="flex flex-wrap gap-2">
          {productColors.map((colorDef) => {
            const active = urlColors.includes(colorDef.name);
            return (
              <button
                key={colorDef.name}
                onClick={() => updateListParam('color', toggleValue(urlColors, colorDef.name))}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs font-medium transition-all"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-dark)',
                        border: '1px solid var(--color-border)',
                      }
                }
              >
                {colorDef.hex ? (
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-black/10"
                    style={{ backgroundColor: colorDef.hex }}
                  />
                ) : (
                  <span className="text-xs">🎨</span>
                )}
                {colorDef.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flower type filter */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>
          Tipo de flor
        </p>
        <div className="flex flex-wrap gap-2">
          {flowerTypes.map((type) => {
            const active = urlTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => updateListParam('tipo', toggleValue(urlTypes, type))}
                className="px-3 py-1 rounded-full font-body text-xs font-medium capitalize transition-all"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-dark)',
                        border: '1px solid var(--color-border)',
                      }
                }
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear all (sidebar only — visible when filters are active) */}
      {isFiltersActive && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 rounded-lg font-body text-xs font-medium transition-all"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
          }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">

      {/* ── Sidebar (desktop only) ──────────────────────────────────── */}
      <aside
        className="hidden md:block w-64 shrink-0 self-start sticky top-28"
      >
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Search bar */}
          <div className="relative mb-5">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: 'var(--color-muted)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar ramos, flores..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg font-body text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-dark)',
              }}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--color-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <p className="font-body text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--color-muted)' }}>
            Filtros
          </p>

          {filterSections}
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Mobile: search bar + collapsible filters */}
        <div
          className="md:hidden rounded-xl p-4 mb-4"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Search bar */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: 'var(--color-muted)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar ramos, girasoles, orquídeas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg font-body text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-dark)',
              }}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--color-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Toggle button */}
          <button
            className="flex items-center gap-2 font-body text-sm font-medium transition-colors"
            style={{ color: 'var(--color-dark)' }}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
            {activeFilterCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {activeFilterCount}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Collapsible filters on mobile */}
          {filtersOpen && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              {filterSections}
            </div>
          )}
        </div>

        {/* ── Active filter chips + results ────────────────────────── */}
        {isFiltersActive && (
          <>
            <ActiveFilterChips
              filters={filters}
              categories={categories}
              productColors={productColors}
              onRemove={handleRemoveFilter}
              onClear={clearAllFilters}
            />

            <p className="font-body text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
              {filteredProducts.length === 0
                ? 'No se encontraron productos con esos filtros.'
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}`}
            </p>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  return (
                    <ProductCardComponent
                      key={product.id}
                      product={product}
                      categorySlug={category?.slug}
                      categoryName={category?.name}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-heading text-2xl text-primary mb-2">Sin resultados</p>
                <p className="font-body text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                  Probá con otros filtros o explorá el catálogo completo.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-medium transition-all text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Category grid (default state, no filters) ──────────── */}
        {!isFiltersActive && <CategoryGrid categories={categories} />}
      </div>
    </div>
  );
}
