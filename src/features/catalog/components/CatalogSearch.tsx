'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Category, Product } from '@/features/catalog/types';
import { PRODUCT_COLORS, PRODUCT_FLOWER_TYPES } from '@/features/catalog/types';
import {
  filterProducts,
  hasActiveFilters,
  getEffectivePrice,
  PRICE_MIN,
  PRICE_MAX,
  type ProductFilters,
} from '@/features/catalog/utils/filterProducts';

interface CatalogSearchProps {
  categories: Category[];
  products: Product[];
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
        <Link
          key={category.id}
          href={`/catalogo/${category.slug}`}
          className="group block rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--color-white)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={category.imageUrl ?? '/placeholder-product.jpg'}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="font-heading text-base sm:text-xl text-primary mb-1 sm:mb-2 group-hover:text-primary/80 leading-tight">
              {category.name}
            </h2>
            <p className="hidden sm:block font-body text-sm text-dark/70 leading-relaxed mb-3">
              {category.description}
            </p>
            <div className="flex items-center text-secondary font-body font-semibold text-sm">
              <span>Ver productos</span>
              <svg
                className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  category,
}: {
  product: Product;
  category: Category | undefined;
}) {
  const effectivePrice = getEffectivePrice(product);
  const hasVariants = Boolean(product.priceTable?.length);

  return (
    <Link
      href={`/catalogo/${category?.slug ?? ''}/${product.slug}`}
      className="group block rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--color-white)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-body text-xs text-muted mb-1 truncate">{category?.name}</p>
        <h3 className="font-heading text-sm sm:text-base text-dark leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="font-body font-semibold text-secondary text-sm sm:text-base">
          {hasVariants ? 'Desde ' : ''}S/{' '}
          {effectivePrice.toLocaleString('es-PE', {
            minimumFractionDigits: effectivePrice % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </Link>
  );
}

// ─── Active filter chips ──────────────────────────────────────────────────────

function ActiveFilterChips({
  filters,
  categories,
  onRemove,
  onClear,
}: {
  filters: ProductFilters;
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
    const colorDef = PRODUCT_COLORS.find((pc) => pc.value === c);
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
        <button
          key={i}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-cream))',
            color: 'var(--color-primary)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
          }}
        >
          {chip.label}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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

export default function CatalogSearch({ categories, products }: CatalogSearchProps) {
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
          {PRODUCT_COLORS.map((colorDef) => {
            const active = urlColors.includes(colorDef.value);
            return (
              <button
                key={colorDef.value}
                onClick={() => updateListParam('color', toggleValue(urlColors, colorDef.value))}
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
          {PRODUCT_FLOWER_TYPES.map((type) => {
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
                    <ProductCard key={product.id} product={product} category={category} />
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
