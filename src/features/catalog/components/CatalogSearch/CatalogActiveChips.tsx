'use client';

import FilterChip from '@/components/ui/FilterChip';
import type { Category } from '@/features/catalog/types';
import {
  PRICE_MAX,
  PRICE_MIN,
  type ProductFilters,
} from '@/features/catalog/utils/filterProducts';

import type { ColorDef } from './CatalogFilterColors';

interface CatalogActiveChipsProps {
  filters: ProductFilters;
  categories: Category[];
  productColors: ColorDef[];
  onRemove: (key: keyof ProductFilters, value?: string) => void;
  onClear: () => void;
}

export default function CatalogActiveChips({
  filters,
  categories,
  productColors,
  onRemove,
  onClear,
}: CatalogActiveChipsProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.q) {
    chips.push({ key: 'q', label: `"${filters.q}"`, onRemove: () => onRemove('q') });
  }
  if (filters.categoria) {
    const cat = categories.find((c) => c.slug === filters.categoria);
    chips.push({
      key: 'categoria',
      label: cat?.name ?? filters.categoria,
      onRemove: () => onRemove('categoria'),
    });
  }
  if (filters.precioMin > PRICE_MIN || filters.precioMax < PRICE_MAX) {
    chips.push({
      key: 'precio',
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
      key: `color:${c}`,
      label: colorDef?.label ?? c,
      onRemove: () => onRemove('colors', c),
    });
  });
  filters.flowerTypes.forEach((t) => {
    chips.push({
      key: `flowerType:${t}`,
      label: t.charAt(0).toUpperCase() + t.slice(1),
      onRemove: () => onRemove('flowerTypes', t),
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}
      <button
        type="button"
        onClick={onClear}
        className="font-body text-xs underline transition-colors text-(--color-muted)"
      >
        Limpiar todo
      </button>
    </div>
  );
}
