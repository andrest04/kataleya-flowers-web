'use client';

import {
  CHIP_ACTIVE_CLS,
  CHIP_BASE_CLS,
  CHIP_INACTIVE_CLS,
  FILTER_LABEL_CLS,
} from './constants';

export interface ColorDef {
  name: string;
  label: string;
  hex: string | null;
}

interface CatalogFilterColorsProps {
  colors: ColorDef[];
  selected: string[];
  onToggle: (color: string) => void;
}

/**
 * Bloque de filtro: chips de color (selección múltiple).
 *
 * Nota: el `style` para `backgroundColor: hex` viene de datos dinámicos de
 * Supabase (`product_colors.hex`) — no es un literal hex en el código fuente,
 * así que no aplica la regla `no-restricted-syntax` (que bloquea hex literales
 * en JSX).
 */
export default function CatalogFilterColors({
  colors,
  selected,
  onToggle,
}: CatalogFilterColorsProps) {
  return (
    <div>
      <p className={FILTER_LABEL_CLS}>Color</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((colorDef) => {
          const active = selected.includes(colorDef.name);
          return (
            <button
              key={colorDef.name}
              type="button"
              onClick={() => onToggle(colorDef.name)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 ${CHIP_BASE_CLS} ${
                active ? CHIP_ACTIVE_CLS : CHIP_INACTIVE_CLS
              }`}
            >
              {colorDef.hex ? (
                <span
                  className="w-3 h-3 rounded-full inline-block border border-black/10"
                  style={{ backgroundColor: colorDef.hex }}
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="w-3 h-3 rounded-full inline-block border border-black/10 bg-(--color-muted)"
                  aria-hidden="true"
                />
              )}
              {colorDef.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
