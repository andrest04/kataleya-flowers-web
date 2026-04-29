'use client';

import type { Category } from '@/features/catalog/types';

import {
  CHIP_ACTIVE_CLS,
  CHIP_BASE_CLS,
  CHIP_INACTIVE_CLS,
  FILTER_LABEL_CLS,
} from './constants';

interface CatalogFilterCategoryProps {
  categories: Category[];
  selected: string; // slug
  onToggle: (slug: string) => void;
}

/** Bloque de filtro: chips de categoría (selección única). */
export default function CatalogFilterCategory({
  categories,
  selected,
  onToggle,
}: CatalogFilterCategoryProps) {
  return (
    <div>
      <p className={FILTER_LABEL_CLS}>Categoría</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = selected === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(active ? '' : cat.slug)}
              aria-pressed={active}
              className={`${CHIP_BASE_CLS} ${active ? CHIP_ACTIVE_CLS : CHIP_INACTIVE_CLS}`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
