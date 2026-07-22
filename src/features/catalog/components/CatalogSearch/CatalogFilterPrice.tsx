'use client';

import { useState } from 'react';

import { PRICE_MAX, PRICE_MIN } from '@/features/catalog/utils/filterProducts';

import { FILTER_LABEL_CLS, INPUT_CLS } from './constants';

interface CatalogFilterPriceProps {
  precioMin: number;
  precioMax: number;
  onChangeParam: (key: string, value: string) => void;
}

interface PriceInputProps {
  ariaLabel: string;
  committedValue: number;
  defaultValue: number;
  min: number;
  max: number;
  paramKey: 'precio_min' | 'precio_max';
  shouldCommit: (value: number) => boolean;
  onChangeParam: (key: string, value: string) => void;
}

function PriceInput({
  ariaLabel,
  committedValue,
  defaultValue,
  min,
  max,
  paramKey,
  shouldCommit,
  onChangeParam,
}: PriceInputProps) {
  const [draft, setDraft] = useState(
    committedValue === defaultValue ? '' : String(committedValue),
  );

  function handleChange(nextValue: string) {
    setDraft(nextValue);

    if (!nextValue) {
      onChangeParam(paramKey, '');
      return;
    }

    const nextNumber = Number(nextValue);
    if (Number.isNaN(nextNumber)) {
      return;
    }

    if (shouldCommit(nextNumber)) {
      onChangeParam(paramKey, String(nextNumber));
    }
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={String(defaultValue)}
      aria-label={ariaLabel}
      className={`${INPUT_CLS} w-20 px-2 py-1.5 text-center`}
    />
  );
}

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
        <PriceInput
          key={`min-${precioMin}`}
          ariaLabel="Precio mínimo"
          committedValue={precioMin}
          defaultValue={PRICE_MIN}
          min={PRICE_MIN}
          max={precioMax}
          paramKey="precio_min"
          shouldCommit={(value) => value > PRICE_MIN}
          onChangeParam={onChangeParam}
        />
        <span className="font-body text-xs text-(--color-muted)">—</span>
        <span className="font-body text-xs text-(--color-muted)">S/</span>
        <PriceInput
          key={`max-${precioMax}`}
          ariaLabel="Precio máximo"
          committedValue={precioMax}
          defaultValue={PRICE_MAX}
          min={precioMin}
          max={PRICE_MAX}
          paramKey="precio_max"
          shouldCommit={(value) => value < PRICE_MAX}
          onChangeParam={onChangeParam}
        />
      </div>
    </div>
  );
}
