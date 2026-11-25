'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';

import { useHeaderVisibility } from '@/components/shared/Navbar/useHeaderVisibility';
import CatalogCollectionCard from '@/features/catalog/components/CatalogCollectionCard';
import CatalogDensityToggle, {
  type CatalogDensity,
} from '@/features/catalog/components/CatalogDensityToggle';
import CatalogFilterSheet, {
  type CatalogColorFacet,
  type CatalogFilters,
  type CatalogSortOption,
} from '@/features/catalog/components/CatalogFilterSheet';
import type { Category, Product } from '@/features/catalog/types';
import {
  catalogCardSizes,
  type CatalogQueryState,
  parseCatalogQuery,
  serializeCatalogQuery,
} from '@/features/catalog/utils/catalogQuery';
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
  density: string;
}

interface CatalogCollectionProps {
  items: CatalogCollectionItem[];
  categories: Category[];
  colors: CatalogColorFacet[];
  flowerTypes: string[];
  initialQuery?: CatalogInitialQuery;
}

const EAGER_CARD_COUNT = 3;

function initialQueryToSearch(query: CatalogInitialQuery | undefined): string {
  if (!query) return '';
  const entries: [string, string][] = [
    ['categoria', query.category],
    ['precio_min', query.priceMin],
    ['precio_max', query.priceMax],
    ['color', query.colors],
    ['tipo', query.flowerTypes],
    ['orden', query.sort],
    ['densidad', query.density],
  ];
  return new URLSearchParams(entries.filter(([, value]) => value)).toString();
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return '';
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
  const maximumPrice = Math.max(0, ...items.map(({ product }) => getEffectivePrice(product)));
  const facets = useMemo(
    () => ({
      categorySlugs: new Set(categories.map((category) => category.slug)),
      colors: new Set(colors.map((color) => color.name)),
      flowerTypes: new Set(flowerTypes),
      maximumPrice,
    }),
    [categories, colors, flowerTypes, maximumPrice],
  );
  const defaultFilters: CatalogFilters = {
    category: [],
    priceMin: 0,
    priceMax: maximumPrice,
    colors: [],
    flowerTypes: [],
  };
  const [query, setQuery] = useState<CatalogQueryState>(() =>
    parseCatalogQuery(initialQueryToSearch(initialQuery), facets),
  );
  const locationSearch = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    getServerLocationSearch,
  );
  const [seededSearch, setSeededSearch] = useState(getServerLocationSearch);
  if (locationSearch !== seededSearch) {
    setSeededSearch(locationSearch);
    setQuery(parseCatalogQuery(locationSearch, facets));
  }
  const { filters, sort: sortOption, density } = query;
  const [sheetOpen, setSheetOpen] = useState(false);
  const isHeaderHidden = useHeaderVisibility();

  const commitQuery = (next: CatalogQueryState) => {
    setQuery(next);
    const search = serializeCatalogQuery(next, maximumPrice, window.location.search);
    const { pathname, hash } = window.location;
    window.history.replaceState(null, '', `${pathname}${search ? `?${search}` : ''}${hash}`);
    setSeededSearch(window.location.search);
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

  const updateFilters = (next: CatalogFilters) => commitQuery({ ...query, filters: next });
  const clearFilters = () => updateFilters(defaultFilters);
  const updateDensity = (next: CatalogDensity) => commitQuery({ ...query, density: next });
  const updateSort = (next: CatalogSortOption) => commitQuery({ ...query, sort: next });
  const cardSizes = catalogCardSizes(density);

  return (
    <>
      <section
        aria-label="Opciones del catálogo"
        className={cn(
          'sticky z-50 mt-8 mb-14 ml-[calc(50%-50vw)] flex min-h-20 w-screen items-stretch border-y border-(--color-primary) bg-(--color-cream) transition-[top] duration-300 ease-out',
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
              onSortChange={updateSort}
            />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 hidden items-center border-l border-(--color-primary) px-14 sm:flex">
          <CatalogDensityToggle density={density} onDensityChange={updateDensity} />
        </div>
      </section>

      <section aria-label="Productos">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {sortedItems.length} producto{sortedItems.length === 1 ? '' : 's'} encontrado
          {sortedItems.length === 1 ? '' : 's'}
        </p>
        {sortedItems.length > 0 ? (
          <div className={cn('grid', DENSITY_GRID_CLASSES[density])}>
            {sortedItems.map(({ product, categorySlug }, index) => (
              <CatalogCollectionCard
                key={product.id}
                product={product}
                categorySlug={categorySlug}
                sizes={cardSizes}
                preload={index === 0}
                loading={index > 0 && index < EAGER_CARD_COUNT ? 'eager' : undefined}
              />
            ))}
          </div>
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
