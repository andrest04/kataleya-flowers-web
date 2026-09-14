'use client';

import { Minus, Plus, SlidersHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/primitives/sheet';
import type { Category } from '@/features/catalog/types';
import { cn } from '@/lib/utils';

export interface CatalogFilters {
  category: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  flowerTypes: string[];
}

export interface CatalogColorFacet {
  name: string;
  label: string;
  hex: string | null;
}

export type CatalogSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_LABELS: Record<CatalogSortOption, string> = {
  featured: 'Selección Kataleya',
  'price-asc': 'Precio: menor a mayor',
  'price-desc': 'Precio: mayor a menor',
  'name-asc': 'Nombre: A–Z',
};

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

function formatPeruvianSoles(value: number): string {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const PRICE_FILTER_DEBOUNCE_MS = 350;

const AccordionSection = forwardRef<
  HTMLDetailsElement,
  {
    title: string;
    subtitle?: string;
    defaultOpen?: boolean;
    children: ReactNode;
  }
>(function AccordionSection({ title, subtitle, defaultOpen, children }, ref) {
  return (
    <details
      ref={ref}
      className="group border-b border-(--color-border) py-4 last:border-0"
      open={defaultOpen}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-body text-base font-semibold text-(--color-dark) [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {subtitle && (
            <span className="ml-1 font-normal text-(--color-muted)">{subtitle}</span>
          )}
        </span>
        <Plus className="size-4 shrink-0 group-open:hidden" aria-hidden="true" />
        <Minus className="hidden size-4 shrink-0 group-open:block" aria-hidden="true" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
});

function OptionTile({
  selected,
  disabled,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center font-body text-xs focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary)',
        disabled
          ? 'cursor-not-allowed border-(--color-border) text-(--color-muted) opacity-50'
          : 'cursor-pointer border-(--color-border) text-(--color-dark)',
        selected && !disabled && 'border-(--color-primary) bg-(--color-surface) font-semibold text-(--color-dark)',
      )}
    >
      {children}
    </label>
  );
}

function AppliedChipsList({
  chips,
}: {
  chips: { key: string; label: string; onRemove: () => void }[];
}) {
  if (chips.length === 0) return null;
  return (
    <div className="border-b border-(--color-border) pb-4">
      <p className="mb-3 font-body text-sm font-semibold text-(--color-dark)">
        Filtros aplicados
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-body text-xs font-semibold text-(--color-dark) transition-colors hover:bg-(--color-dark)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            {chip.label}
            <X className="size-3" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SortAccordion({
  sortOption,
  onSelect,
  sectionRef,
}: {
  sortOption: CatalogSortOption;
  onSelect: (option: CatalogSortOption) => void;
  sectionRef: React.Ref<HTMLDetailsElement>;
}) {
  return (
    <AccordionSection ref={sectionRef} title="Ordenar por:" subtitle={SORT_LABELS[sortOption]}>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(SORT_LABELS) as CatalogSortOption[]).map((option) => {
          const selected = sortOption === option;
          return (
            <OptionTile key={option} selected={selected}>
              <input
                type="radio"
                name="orden"
                value={option}
                checked={selected}
                onChange={() => onSelect(option)}
                className="sr-only"
              />
              <span>{SORT_LABELS[option]}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}

function CategoryAccordion({
  categories,
  selectedSlugs,
  availableCategorySlugs,
  onToggle,
}: {
  categories: Category[];
  selectedSlugs: Set<string>;
  availableCategorySlugs: Set<string>;
  onToggle: (slug: string) => void;
}) {
  if (categories.length === 0) return null;
  return (
    <AccordionSection title="Categoría">
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => {
          const selected = selectedSlugs.has(category.slug);
          const disabled = !selected && !availableCategorySlugs.has(category.slug);
          return (
            <OptionTile key={category.slug} selected={selected} disabled={disabled}>
              <input
                type="checkbox"
                name="categoria"
                value={category.slug}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(category.slug)}
                className="sr-only"
              />
              <span>{category.name}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}

function PriceAccordion({
  maximumPrice,
  priceMinDraft,
  priceMaxDraft,
  onPriceMinDraftChange,
  onPriceMaxDraftChange,
  onReset,
}: {
  maximumPrice: number;
  priceMinDraft: string;
  priceMaxDraft: string;
  onPriceMinDraftChange: (value: string) => void;
  onPriceMaxDraftChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <AccordionSection title="Precio" defaultOpen>
      <p className="mb-3 font-body text-sm text-(--color-dark)">
        El precio más alto es S/ {formatPeruvianSoles(maximumPrice)}{' '}
        <button
          type="button"
          onClick={onReset}
          className="inline-block px-2 py-2 font-semibold text-(--color-muted) underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          Restablecer
        </button>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block rounded-lg border border-(--color-border) bg-(--color-cream) px-3 py-2 font-body text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary)">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-(--color-muted)">
            Desde
          </span>
          <span className="flex items-center gap-1">
            <span className="text-(--color-muted)">S/</span>
            <input
              type="number"
              inputMode="decimal"
              name="priceMin"
              autoComplete="off"
              min={0}
              max={maximumPrice}
              value={priceMinDraft}
              onChange={(event) => onPriceMinDraftChange(event.target.value)}
              className="w-full bg-transparent text-base focus:outline-none"
            />
          </span>
        </label>
        <label className="block rounded-lg border border-(--color-border) bg-(--color-cream) px-3 py-2 font-body text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary)">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-(--color-muted)">
            Hasta
          </span>
          <span className="flex items-center gap-1">
            <span className="text-(--color-muted)">S/</span>
            <input
              type="number"
              inputMode="decimal"
              name="priceMax"
              autoComplete="off"
              min={0}
              max={maximumPrice}
              value={priceMaxDraft}
              onChange={(event) => onPriceMaxDraftChange(event.target.value)}
              className="w-full bg-transparent text-base focus:outline-none"
            />
          </span>
        </label>
      </div>
    </AccordionSection>
  );
}

function ColorAccordion({
  colors,
  selectedNames,
  availableColors,
  onToggle,
}: {
  colors: CatalogColorFacet[];
  selectedNames: Set<string>;
  availableColors: Set<string>;
  onToggle: (name: string) => void;
}) {
  if (colors.length === 0) return null;
  return (
    <AccordionSection title="Color">
      <div className="grid grid-cols-3 gap-2">
        {colors.map((color) => {
          const selected = selectedNames.has(color.name);
          const disabled = !selected && !availableColors.has(color.name);
          return (
            <OptionTile key={color.name} selected={selected} disabled={disabled}>
              <input
                type="checkbox"
                name="color"
                value={color.name}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(color.name)}
                className="sr-only"
              />
              {color.hex && (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-(--color-border)"
                  style={{ backgroundColor: color.hex }}
                />
              )}
              <span>{color.label}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}

function FlowerTypeAccordion({
  flowerTypes,
  selectedTypes,
  availableFlowerTypes,
  onToggle,
}: {
  flowerTypes: string[];
  selectedTypes: Set<string>;
  availableFlowerTypes: Set<string>;
  onToggle: (flowerType: string) => void;
}) {
  if (flowerTypes.length === 0) return null;
  return (
    <AccordionSection title="Tipo de flor">
      <div className="grid grid-cols-3 gap-2">
        {flowerTypes.map((flowerType) => {
          const selected = selectedTypes.has(flowerType);
          const disabled = !selected && !availableFlowerTypes.has(flowerType);
          return (
            <OptionTile key={flowerType} selected={selected} disabled={disabled}>
              <input
                type="checkbox"
                name="tipo"
                value={flowerType}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(flowerType)}
                className="sr-only"
              />
              <span>{flowerType}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}

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
