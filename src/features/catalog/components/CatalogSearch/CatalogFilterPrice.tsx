'use client';

import { PRICE_MAX,PRICE_MIN } from '@/features/catalog/utils/filterProducts';

import { FILTER_LABEL_CLS, INPUT_CLS } from './constants';

interface CatalogFilterPriceProps {
  precioMin: number;
  precioMax: number;
  onChangeParam: (key: string, value: string) => void;
}

/**
 * Filtro de rango de precio (S/ min — S/ max).
 * Vacío = sentinela `PRICE_MIN`/`PRICE_MAX`. La URL solo se setea cuando el
 * valor difiere del default.
 */
export default function CatalogFilterPrice({
  precioMin,
  precioMax,
  onChangeParam,
}: CatalogFilterPriceProps) {
  return (
    <div>
      <p className={FILTER_LABEL_CLS}>Precio</p>
      <div className="flex items-center gap-2">
        <span className="font-body text-xs text-(--color-muted)">S/</span>
        <input
          type="number"
          min={PRICE_MIN}
          max={precioMax}
          value={precioMin === PRICE_MIN ? '' : precioMin}
          onChange={(e) => {
            const val = Number(e.target.value) || PRICE_MIN;
            onChangeParam('precio_min', val > PRICE_MIN ? String(val) : '');
          }}
          placeholder={String(PRICE_MIN)}
          aria-label="Precio mínimo"
          className={`${INPUT_CLS} w-20 px-2 py-1.5 text-center`}
        />
        <span className="font-body text-xs text-(--color-muted)">—</span>
        <span className="font-body text-xs text-(--color-muted)">S/</span>
        <input
          type="number"
          min={precioMin}
          max={PRICE_MAX}
          value={precioMax === PRICE_MAX ? '' : precioMax}
          onChange={(e) => {
            const val = Number(e.target.value) || PRICE_MAX;
            onChangeParam('precio_max', val < PRICE_MAX ? String(val) : '');
          }}
          placeholder={String(PRICE_MAX)}
          aria-label="Precio máximo"
          className={`${INPUT_CLS} w-20 px-2 py-1.5 text-center`}
        />
      </div>
    </div>
  );
}
