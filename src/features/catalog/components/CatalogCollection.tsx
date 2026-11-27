'use client';

import { MessageCircle } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { useHeaderVisibility } from '@/components/shared/Navbar/useHeaderVisibility';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import FilterChip from '@/components/ui/FilterChip';
import CatalogCollectionCard from '@/features/catalog/components/CatalogCollectionCard';
import CatalogDensityToggle, {
  type CatalogDensity,
} from '@/features/catalog/components/CatalogDensityToggle';
import CatalogExploreMore from '@/features/catalog/components/CatalogExploreMore';
import CatalogFilterSheet, {
  type CatalogColorFacet,
  type CatalogFilters,
  type CatalogSortOption,
} from '@/features/catalog/components/CatalogFilterSheet';
import type { CatalogCardProduct, Category } from '@/features/catalog/types';
import {
  catalogCardSizes,
  type CatalogQueryState,
  parseCatalogQuery,
  serializeCatalogQuery,
} from '@/features/catalog/utils/catalogQuery';
import {
  filterProducts,
  getEffectivePrice,
  type ProductFilters,
} from '@/features/catalog/utils/filterProducts';
import { cn } from '@/lib/utils';

const DENSITY_GRID_CLASSES: Record<CatalogDensity, string> = {
  2: 'grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-2',
  3: 'grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3',
  4: 'grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-4',
};

export interface CatalogCollectionItem {
  product: CatalogCardProduct;
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
  whatsappHref?: string;
  relatedCategories?: Category[];
  showCatalogLink?: boolean;
}

const SPARSE_ITEM_COUNT = 2;

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

function toProductFilters({ category, ...rest }: CatalogFilters): ProductFilters {
  return { ...rest, categorySlugs: category };
}

interface AppliedChip {
  key: string;
  label: string;
  onRemove: () => void;
}

function ResultsSummary({
  countLabel,
  chips,
  onClear,
  className,
}: {
  countLabel?: string;
  chips: AppliedChip[];
  onClear: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      {countLabel && (
        <p
          className="font-body text-sm font-semibold text-(--color-dark)"
          aria-live="polite"
          aria-atomic="true"
        >
          {countLabel}
        </p>
      )}
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}
      {chips.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-11 px-2 font-body text-sm font-semibold text-(--color-primary) underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export default function CatalogCollection({
  items,
  categories,
  colors,
  flowerTypes,
  initialQuery,
  whatsappHref,
  relatedCategories = [],
  showCatalogLink = false,
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

  const productFilters = useMemo(() => toProductFilters(filters), [filters]);
  const filteredItems = useMemo(
    () => filterProducts(items, productFilters),
    [items, productFilters],
  );
  const availableCategorySlugs = useMemo(
    () =>
      new Set(filterProducts(items, productFilters, 'category').map((item) => item.categorySlug)),
    [items, productFilters],
  );
  const availableColors = useMemo(
    () =>
      new Set(
        filterProducts(items, productFilters, 'colors').flatMap(
          ({ product }) => product.colors ?? [],
        ),
      ),
    [items, productFilters],
  );
  const availableFlowerTypes = useMemo(
    () =>
      new Set(
        filterProducts(items, productFilters, 'flowerTypes').flatMap(
          ({ product }) => product.flowerTypes ?? [],
        ),
      ),
    [items, productFilters],
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
  const isSparse = sortedItems.length > 0 && sortedItems.length <= SPARSE_ITEM_COUNT;
  const countLabel = `${sortedItems.length} ${sortedItems.length === 1 ? 'arreglo' : 'arreglos'}`;
  const appliedChips = [
    ...filters.category.map((slug) => ({
      key: `category-${slug}`,
      label: categories.find((category) => category.slug === slug)?.name ?? slug,
      onRemove: () =>
        updateFilters({ ...filters, category: filters.category.filter((value) => value !== slug) }),
    })),
    ...filters.colors.map((name) => ({
      key: `color-${name}`,
      label: colors.find((color) => color.name === name)?.label ?? name,
      onRemove: () =>
        updateFilters({ ...filters, colors: filters.colors.filter((value) => value !== name) }),
    })),
    ...filters.flowerTypes.map((flowerType) => ({
      key: `flower-${flowerType}`,
      label: flowerType,
      onRemove: () =>
        updateFilters({
          ...filters,
          flowerTypes: filters.flowerTypes.filter((value) => value !== flowerType),
        }),
    })),
  ];

  return (
    <>
      <section
        aria-label="Opciones del catálogo"
        className={cn(
          'sticky z-50 mt-4 mb-6 ml-[calc(50%-50vw)] flex min-h-20 w-screen items-stretch border-y border-(--color-primary) bg-(--color-cream) transition-[top] duration-300 ease-out',
          isHeaderHidden ? 'top-0' : 'top-[calc(6.5rem-1px)]',
        )}
      >
        <div className="flex min-w-0 flex-1 items-stretch sm:w-auto sm:flex-none sm:shrink-0 sm:border-r sm:border-(--color-primary)">
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
        <p className="flex shrink-0 items-center border-l border-(--color-primary) px-4 font-body text-sm font-semibold text-(--color-dark) sm:hidden">
          {countLabel}
        </p>
        <div className="hidden min-w-0 flex-1 items-center px-6 py-2 sm:flex">
          <ResultsSummary
            countLabel={countLabel}
            chips={appliedChips}
            onClear={clearFilters}
            className="justify-center"
          />
        </div>
        <div className="hidden shrink-0 items-center border-l border-(--color-primary) px-14 sm:flex">
          <CatalogDensityToggle density={density} onDensityChange={updateDensity} />
        </div>
      </section>

      <section aria-label="Productos">
        {appliedChips.length > 0 && (
          <div className="mb-6 sm:hidden">
            <ResultsSummary
              chips={appliedChips}
              onClear={clearFilters}
              className="justify-center"
            />
          </div>
        )}
        {sortedItems.length > 0 ? (
          <div
            className={cn(
              'grid',
              isSparse
                ? 'mx-auto grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2'
                : DENSITY_GRID_CLASSES[density],
              sortedItems.length === 1 ? 'max-w-sm sm:grid-cols-1' : isSparse && 'max-w-2xl',
            )}
          >
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
          <EmptyState
            message="No encontramos arreglos con esos filtros. Prueba quitando alguno o cuéntanos qué buscas."
            action={
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-11 border border-(--color-border) px-4 font-body font-semibold text-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
                >
                  Limpiar filtros
                </button>
                {whatsappHref && (
                  <Button variant="whatsapp" size="md" href={whatsappHref} external>
                    <MessageCircle className="size-5" aria-hidden="true" />
                    Pedir por WhatsApp
                  </Button>
                )}
              </div>
            }
          />
        )}
        {sortedItems.length > 0 && whatsappHref && (
          <CatalogExploreMore
            whatsappHref={whatsappHref}
            relatedCategories={isSparse ? relatedCategories : []}
            showCatalogLink={showCatalogLink}
          />
        )}
      </section>
    </>
  );
}
