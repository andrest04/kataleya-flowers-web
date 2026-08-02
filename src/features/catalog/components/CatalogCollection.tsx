'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useHeaderVisibility } from '@/components/shared/Navbar/useHeaderVisibility';
import CatalogCollectionCard from '@/features/catalog/components/CatalogCollectionCard';
import CatalogDensityToggle, {
  type CatalogDensity,
} from '@/features/catalog/components/CatalogDensityToggle';
import CatalogFilterSheet, {
  type CatalogColorFacet,
  type CatalogFilters,
} from '@/features/catalog/components/CatalogFilterSheet';
import type { Category, Product } from '@/features/catalog/types';
import { getEffectivePrice } from '@/features/catalog/utils/filterProducts';
import { cn } from '@/lib/utils';

const DENSITY_GRID_CLASSES: Record<CatalogDensity, string> = {
  2: 'grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-2',
  3: 'grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3',
  4: 'grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-4',
};

export interface CatalogCollectionItem {
  product: Product;
  categorySlug: string;
}

interface CatalogInitialQuery {
  category: string;
  priceMin: string;
  priceMax: string;
  colors: string;
  flowerTypes: string;
  sort: string;
}

interface CatalogCollectionProps {
  items: CatalogCollectionItem[];
  categories: Category[];
  colors: CatalogColorFacet[];
  flowerTypes: string[];
  initialQuery: CatalogInitialQuery;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: SortOption[] = ['featured', 'price-asc', 'price-desc', 'name-asc'];
const PAGE_SIZE = 10;

function parseList(value: string, allowedValues: Set<string>): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && allowedValues.has(item));
}

function parsePrice(value: string, fallback: number, maximumPrice: number): number {
  if (!value.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximumPrice, Math.max(0, parsed)) : fallback;
}

type FilterFacet = 'category' | 'price' | 'colors' | 'flowerTypes';

function filterItems(
  items: CatalogCollectionItem[],
  filters: CatalogFilters,
  except?: FilterFacet,
) {
  return items.filter(({ product, categorySlug }) => {
    if (
      except !== 'category' &&
      filters.category.length > 0 &&
      !filters.category.includes(categorySlug)
    ) {
      return false;
    }
    const price = getEffectivePrice(product);
    if (except !== 'price' && (price < filters.priceMin || price > filters.priceMax)) {
      return false;
    }
    if (
      except !== 'colors' &&
      filters.colors.length > 0 &&
      !filters.colors.some((color) => product.colors?.includes(color))
    ) {
      return false;
    }
    if (
      except !== 'flowerTypes' &&
      filters.flowerTypes.length > 0 &&
      !filters.flowerTypes.some((flowerType) => product.flowerTypes?.includes(flowerType))
    ) {
      return false;
    }
    return true;
  });
}

export default function CatalogCollection({
  items,
  categories,
  colors,
  flowerTypes,
  initialQuery,
}: CatalogCollectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const maximumPrice = Math.max(0, ...items.map(({ product }) => getEffectivePrice(product)));
  const defaultFilters: CatalogFilters = {
    category: [],
    priceMin: 0,
    priceMax: maximumPrice,
    colors: [],
    flowerTypes: [],
  };
  const [filters, setFilters] = useState<CatalogFilters>(() => {
    const categorySlugs = new Set(categories.map((category) => category.slug));
    const allowedColors = new Set(colors.map((color) => color.name));
    const allowedFlowerTypes = new Set(flowerTypes);
    return {
      category: parseList(initialQuery.category, categorySlugs),
      priceMin: parsePrice(initialQuery.priceMin, 0, maximumPrice),
      priceMax: parsePrice(initialQuery.priceMax, maximumPrice, maximumPrice),
      colors: parseList(initialQuery.colors, allowedColors),
      flowerTypes: parseList(initialQuery.flowerTypes, allowedFlowerTypes),
    };
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(
    SORT_OPTIONS.includes(initialQuery.sort as SortOption)
      ? (initialQuery.sort as SortOption)
      : 'featured',
  );
  const [density, setDensity] = useState<CatalogDensity>(3);
  const isHeaderHidden = useHeaderVisibility();

  const syncQuery = (filters: CatalogFilters, sort: SortOption) => {
    const params = new URLSearchParams(window.location.search);
    ['categoria', 'precio_min', 'precio_max', 'color', 'tipo'].forEach((key) =>
      params.delete(key),
    );
    if (filters.category.length) params.set('categoria', filters.category.join(','));
    if (filters.priceMin > 0) params.set('precio_min', String(filters.priceMin));
    if (filters.priceMax < maximumPrice) params.set('precio_max', String(filters.priceMax));
    if (filters.colors.length) params.set('color', filters.colors.join(','));
    if (filters.flowerTypes.length) params.set('tipo', filters.flowerTypes.join(','));
    if (sort === 'featured') params.delete('orden');
    else params.set('orden', sort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const filteredItems = useMemo(() => filterItems(items, filters), [filters, items]);
  const availableCategorySlugs = useMemo(
    () => new Set(filterItems(items, filters, 'category').map((item) => item.categorySlug)),
    [items, filters],
  );
  const availableColors = useMemo(
    () =>
      new Set(
        filterItems(items, filters, 'colors').flatMap(({ product }) => product.colors ?? []),
      ),
    [items, filters],
  );
  const availableFlowerTypes = useMemo(
    () =>
      new Set(
        filterItems(items, filters, 'flowerTypes').flatMap(
          ({ product }) => product.flowerTypes ?? [],
        ),
      ),
    [items, filters],
  );
  const sortedItems = useMemo(() => {
    const copy = [...filteredItems];
    switch (sortOption) {
      case 'featured':
        return copy.sort(
          (a, b) => Number(Boolean(b.product.isFeatured)) - Number(Boolean(a.product.isFeatured)),
        );
      case 'price-asc':
        return copy.sort(
          (a, b) => getEffectivePrice(a.product) - getEffectivePrice(b.product),
        );
      case 'price-desc':
        return copy.sort(
          (a, b) => getEffectivePrice(b.product) - getEffectivePrice(a.product),
        );
      case 'name-asc':
        return copy.sort((a, b) => a.product.name.localeCompare(b.product.name, 'es-PE'));
    }
  }, [filteredItems, sortOption]);

  const updateFilters = (next: CatalogFilters) => {
    setFilters(next);
    syncQuery(next, sortOption);
  };
  const clearFilters = () => updateFilters(defaultFilters);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const resetKey = `${JSON.stringify(filters)}|${sortOption}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setVisibleCount(PAGE_SIZE);
  }
  const visibleItems = sortedItems.slice(0, visibleCount);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, sortedItems.length));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedItems.length]);

  return (
    <>
      <section
        aria-label="Opciones del catálogo"
        className={cn(
          'sticky z-50 my-8 ml-[calc(50%-50vw)] flex min-h-20 w-screen items-stretch border-y border-(--color-primary) bg-(--color-cream) transition-[top] duration-300 ease-out',
          isHeaderHidden ? 'top-0' : 'top-[calc(6.5rem-1px)]',
        )}
      >
        <div className="mx-auto flex max-w-8xl flex-wrap items-stretch divide-x divide-(--color-primary)">
          <div className="flex w-full items-stretch border-(--color-primary) sm:w-auto sm:absolute sm:inset-y-0 sm:left-0 sm:border-r">
            <CatalogFilterSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              filters={filters}
              onFiltersChange={updateFilters}
              categories={categories}
              colors={colors}
              flowerTypes={flowerTypes}
              availableCategorySlugs={availableCategorySlugs}
              availableColors={availableColors}
              availableFlowerTypes={availableFlowerTypes}
              maximumPrice={maximumPrice}
              sortOption={sortOption}
              onSortChange={(sort) => {
                setSortOption(sort);
                syncQuery(filters, sort);
              }}
            />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 hidden items-center border-l border-(--color-primary) px-14 sm:flex">
          <CatalogDensityToggle density={density} onDensityChange={setDensity} />
        </div>
      </section>

      <section aria-label="Productos">
        {sortedItems.length > 0 ? (
          <>
            <div className={cn('grid', DENSITY_GRID_CLASSES[density])}>
              {visibleItems.map(({ product, categorySlug }) => (
                <CatalogCollectionCard
                  key={product.id}
                  product={product}
                  categorySlug={categorySlug}
                />
              ))}
            </div>
            {visibleCount < sortedItems.length && <div ref={loadMoreRef} aria-hidden="true" />}
          </>
        ) : (
          <div className="py-16 text-center font-body text-(--color-muted)">
            <p>No encontramos productos con esos filtros.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 min-h-11 border border-(--color-border) px-4 font-semibold text-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>
    </>
  );
}
