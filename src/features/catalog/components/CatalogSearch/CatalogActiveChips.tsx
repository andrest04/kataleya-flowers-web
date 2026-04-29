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

/**
 * Renderiza chips de los filtros actualmente activos + botón "Limpiar todo".
 * Cada chip dispara `onRemove` con la clave del filtro y el valor (cuando
 * el filtro es lista — colores, tipos de flor).
 */
export default function CatalogActiveChips({
  filters,
  categories,
  productColors,
  onRemove,
  onClear,
}: CatalogActiveChipsProps) {
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
        type="button"
        onClick={onClear}
        className="font-body text-xs underline transition-colors text-(--color-muted)"
      >
        Limpiar todo
      </button>
    </div>
  );
}
