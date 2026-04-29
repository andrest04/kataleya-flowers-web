'use client';

import {
  CHIP_ACTIVE_CLS,
  CHIP_BASE_CLS,
  CHIP_INACTIVE_CLS,
  FILTER_LABEL_CLS,
} from './constants';

interface CatalogFilterFlowersProps {
  flowerTypes: string[];
  selected: string[];
  onToggle: (type: string) => void;
}

/** Bloque de filtro: chips de tipo de flor (selección múltiple). */
export default function CatalogFilterFlowers({
  flowerTypes,
  selected,
  onToggle,
}: CatalogFilterFlowersProps) {
  return (
    <div>
      <p className={FILTER_LABEL_CLS}>Tipo de flor</p>
      <div className="flex flex-wrap gap-2">
        {flowerTypes.map((type) => {
          const active = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggle(type)}
              aria-pressed={active}
              className={`capitalize ${CHIP_BASE_CLS} ${
                active ? CHIP_ACTIVE_CLS : CHIP_INACTIVE_CLS
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
