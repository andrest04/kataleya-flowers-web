'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/primitives/sheet';
import type { Category } from '@/features/catalog/types';

import AppliedChipsList from './AppliedChipsList';
import CategoryAccordion from './CategoryAccordion';
import ColorAccordion from './ColorAccordion';
import FlowerTypeAccordion from './FlowerTypeAccordion';
import PriceAccordion from './PriceAccordion';
import SortAccordion from './SortAccordion';
import type { CatalogColorFacet, CatalogFilters, CatalogSortOption } from './types';

export type { CatalogColorFacet, CatalogFilters, CatalogSortOption } from './types';

interface CatalogFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  categories: Category[];
  colors: CatalogColorFacet[];
  flowerTypes: string[];
  availableCategorySlugs: Set<string>;
  availableColors: Set<string>;
  availableFlowerTypes: Set<string>;
  maximumPrice: number;
  sortOption: CatalogSortOption;
  onSortChange: (sort: CatalogSortOption) => void;
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function parsePriceInput(raw: string): number | undefined {
  if (raw === '') return undefined;
  const next = Number(raw);
  if (!Number.isFinite(next)) return undefined;
  return next;
}

const PRICE_FILTER_DEBOUNCE_MS = 350;

export default function CatalogFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  categories,
  colors,
  flowerTypes,
  availableCategorySlugs,
  availableColors,
  availableFlowerTypes,
  maximumPrice,
  sortOption,
  onSortChange,
}: CatalogFilterSheetProps) {
  const update = <Key extends keyof CatalogFilters>(
    key: Key,
    value: CatalogFilters[Key],
  ) => onFiltersChange({ ...filters, [key]: value });

  const latestRef = useRef({ filters, onFiltersChange });
  useEffect(() => {
    latestRef.current = { filters, onFiltersChange };
  });

  const [priceMinDraft, setPriceMinDraft] = useState(() => String(filters.priceMin));
  const [priceMaxDraft, setPriceMaxDraft] = useState(() => String(filters.priceMax));
  const [syncedPriceMin, setSyncedPriceMin] = useState(filters.priceMin);
  const [syncedPriceMax, setSyncedPriceMax] = useState(filters.priceMax);

  if (filters.priceMin !== syncedPriceMin) {
    setSyncedPriceMin(filters.priceMin);
    setPriceMinDraft(String(filters.priceMin));
  }

  if (filters.priceMax !== syncedPriceMax) {
    setSyncedPriceMax(filters.priceMax);
    setPriceMaxDraft(String(filters.priceMax));
  }

  useEffect(() => {
    const next = parsePriceInput(priceMinDraft);
    if (next === undefined || next === latestRef.current.filters.priceMin) return;
    const timer = setTimeout(() => {
      const { filters: currentFilters, onFiltersChange: currentOnFiltersChange } = latestRef.current;
      currentOnFiltersChange({ ...currentFilters, priceMin: next });
    }, PRICE_FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [priceMinDraft]);

  useEffect(() => {
    const next = parsePriceInput(priceMaxDraft);
    if (next === undefined || next === latestRef.current.filters.priceMax) return;
    const timer = setTimeout(() => {
      const { filters: currentFilters, onFiltersChange: currentOnFiltersChange } = latestRef.current;
      currentOnFiltersChange({ ...currentFilters, priceMax: next });
    }, PRICE_FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [priceMaxDraft]);

  const sortSectionRef = useRef<HTMLDetailsElement>(null);
  const selectSort = (option: CatalogSortOption) => {
    onSortChange(option);
    if (sortSectionRef.current) sortSectionRef.current.open = false;
  };

  const appliedChips = [
    ...filters.category.map((slug) => ({
      key: `category-${slug}`,
      label: `Categoría: ${categories.find((category) => category.slug === slug)?.name ?? slug}`,
      onRemove: () => update('category', filters.category.filter((value) => value !== slug)),
    })),
    ...filters.colors.map((name) => ({
      key: `color-${name}`,
      label: `Color: ${colors.find((color) => color.name === name)?.label ?? name}`,
      onRemove: () => update('colors', filters.colors.filter((value) => value !== name)),
    })),
    ...filters.flowerTypes.map((flowerType) => ({
      key: `flower-${flowerType}`,
      label: `Tipo de flor: ${flowerType}`,
      onRemove: () =>
        update('flowerTypes', filters.flowerTypes.filter((value) => value !== flowerType)),
    })),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-full min-h-11 w-full cursor-pointer items-center gap-2 px-4 font-body text-sm font-semibold text-(--color-dark) transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) sm:px-14"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtrar y ordenar
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        overlayClassName="z-[100] bg-(--color-dark)/70 backdrop-blur-none duration-300 supports-backdrop-filter:backdrop-blur-none"
        className="z-[100] max-w-md gap-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-cream) text-(--color-dark) shadow-2xl duration-300 data-[side=left]:inset-y-6 data-[side=left]:left-6 data-[side=left]:h-[calc(100%-3rem)] data-[side=left]:w-[calc(100%-3rem)] data-[side=left]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-start justify-between gap-4 px-7 pt-7 pb-3">
          <SheetTitle className="mt-5 font-heading text-[32px] text-(--color-dark)">
            Filtrar y ordenar
          </SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Cerrar"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-border) transition-colors hover:bg-(--color-dark)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-7 pt-1 pb-5">
          <AppliedChipsList chips={appliedChips} />

          <SortAccordion sortOption={sortOption} onSelect={selectSort} sectionRef={sortSectionRef} />

          <CategoryAccordion
            categories={categories}
            selectedSlugs={new Set(filters.category)}
            availableCategorySlugs={availableCategorySlugs}
            onToggle={(slug) => update('category', toggle(filters.category, slug))}
          />

          <PriceAccordion
            maximumPrice={maximumPrice}
            priceMinDraft={priceMinDraft}
            priceMaxDraft={priceMaxDraft}
            onPriceMinDraftChange={setPriceMinDraft}
            onPriceMaxDraftChange={setPriceMaxDraft}
            onReset={() => {
              update('priceMin', 0);
              update('priceMax', maximumPrice);
            }}
          />

          <ColorAccordion
            colors={colors}
            selectedNames={new Set(filters.colors)}
            availableColors={availableColors}
            onToggle={(name) => update('colors', toggle(filters.colors, name))}
          />

          <FlowerTypeAccordion
            flowerTypes={flowerTypes}
            selectedTypes={new Set(filters.flowerTypes)}
            availableFlowerTypes={availableFlowerTypes}
            onToggle={(flowerType) => update('flowerTypes', toggle(filters.flowerTypes, flowerType))}
          />

          {colors.length === 0 && flowerTypes.length === 0 && (
            <p className="py-4 font-body text-sm text-(--color-muted)">
              No hay opciones disponibles.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
