'use client';

import { Minus, Plus, SlidersHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { forwardRef, useRef } from 'react';

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
          className="flex h-full min-h-11 w-full cursor-pointer items-center gap-2 px-14 font-body text-sm font-semibold text-(--color-dark) transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtrar y ordenar
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        overlayClassName="z-[100] bg-(--color-dark)/70 backdrop-blur-none duration-300 supports-backdrop-filter:backdrop-blur-none"
        className="z-[100] w-full max-w-md gap-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-cream) text-(--color-dark) shadow-2xl duration-300 data-[side=left]:inset-y-6 data-[side=left]:left-6 data-[side=left]:h-[calc(100%-3rem)] data-[side=left]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-start justify-between gap-4 px-7 pt-7 pb-3">
          <SheetTitle className="mt-5 font-heading text-[32px] text-(--color-dark)">
            Filtrar y ordenar
          </SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Cerrar"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-border) transition-colors hover:bg-(--color-dark)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-7 pt-1 pb-5">
          {appliedChips.length > 0 && (
            <div className="border-b border-(--color-border) pb-4">
              <p className="mb-3 font-body text-sm font-semibold text-(--color-dark)">
                Filtros aplicados
              </p>
              <div className="flex flex-wrap gap-2">
                {appliedChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-body text-xs font-semibold text-(--color-dark) transition-colors hover:bg-(--color-dark)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
                  >
                    {chip.label}
                    <X className="size-3" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <AccordionSection
            ref={sortSectionRef}
            title="Ordenar por:"
            subtitle={SORT_LABELS[sortOption]}
          >
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
                      onChange={() => selectSort(option)}
                      className="sr-only"
                    />
                    <span>{SORT_LABELS[option]}</span>
                  </OptionTile>
                );
              })}
            </div>
          </AccordionSection>

          <AccordionSection title="Categoría">
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => {
                const selected = filters.category.includes(category.slug);
                const disabled = !selected && !availableCategorySlugs.has(category.slug);
                return (
                  <OptionTile key={category.slug} selected={selected} disabled={disabled}>
                    <input
                      type="checkbox"
                      name="categoria"
                      value={category.slug}
                      checked={selected}
                      disabled={disabled}
                      onChange={() => update('category', toggle(filters.category, category.slug))}
                      className="sr-only"
                    />
                    <span>{category.name}</span>
                  </OptionTile>
                );
              })}
            </div>
          </AccordionSection>

          <AccordionSection title="Precio" defaultOpen>
            <p className="mb-3 font-body text-sm text-(--color-dark)">
              El precio más alto es S/ {maximumPrice.toFixed(2)}{' '}
              <button
                type="button"
                onClick={() => {
                  update('priceMin', 0);
                  update('priceMax', maximumPrice);
                }}
                className="font-semibold text-(--color-muted) underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
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
                    min={0}
                    max={maximumPrice}
                    value={filters.priceMin}
                    onChange={(event) => update('priceMin', Number(event.target.value))}
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
                    min={0}
                    max={maximumPrice}
                    value={filters.priceMax}
                    onChange={(event) => update('priceMax', Number(event.target.value))}
                    className="w-full bg-transparent text-base focus:outline-none"
                  />
                </span>
              </label>
            </div>
          </AccordionSection>

          {colors.length > 0 && (
            <AccordionSection title="Color">
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => {
                  const selected = filters.colors.includes(color.name);
                  const disabled = !selected && !availableColors.has(color.name);
                  return (
                    <OptionTile key={color.name} selected={selected} disabled={disabled}>
                      <input
                        type="checkbox"
                        name="color"
                        value={color.name}
                        checked={selected}
                        disabled={disabled}
                        onChange={() => update('colors', toggle(filters.colors, color.name))}
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
          )}

          {flowerTypes.length > 0 && (
            <AccordionSection title="Tipo de flor">
              <div className="grid grid-cols-3 gap-2">
                {flowerTypes.map((flowerType) => {
                  const selected = filters.flowerTypes.includes(flowerType);
                  const disabled = !selected && !availableFlowerTypes.has(flowerType);
                  return (
                    <OptionTile key={flowerType} selected={selected} disabled={disabled}>
                      <input
                        type="checkbox"
                        name="tipo"
                        value={flowerType}
                        checked={selected}
                        disabled={disabled}
                        onChange={() =>
                          update('flowerTypes', toggle(filters.flowerTypes, flowerType))
                        }
                        className="sr-only"
                      />
                      <span>{flowerType}</span>
                    </OptionTile>
                  );
                })}
              </div>
            </AccordionSection>
          )}

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
