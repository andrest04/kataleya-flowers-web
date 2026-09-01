'use client';

import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import type { ValuePropDestinationMode } from './types';

const MODES: { label: string; value: ValuePropDestinationMode }[] = [
  { label: 'Ancla en la página', value: 'anchor' },
  { label: 'Ruta del sitio', value: 'route' },
  { label: 'Enlace externo', value: 'external' },
];

interface DestinationModePickerProps {
  error?: string;
  idPrefix: string;
  value: ValuePropDestinationMode;
  onChange: (mode: ValuePropDestinationMode) => void;
}

export default function DestinationModePicker({
  error,
  idPrefix,
  value,
  onChange,
}: DestinationModePickerProps) {
  const errorId = `${idPrefix}-destination-error`;

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={`${idPrefix}-destination-label`}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {MODES.map((mode) => {
          const selected = value === mode.value;
          return (
            <label
              key={mode.value}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm transition-[transform,background-color,border-color] duration-200 ease-out focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary) active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                selected
                  ? 'border-(--color-primary) bg-(--color-surface) text-(--color-dark)'
                  : 'border-(--color-border) bg-(--color-white) text-(--color-dark)'
              }`}
            >
              <input
                type="radio"
                name={`${idPrefix}-destination`}
                value={mode.value}
                checked={selected}
                className="sr-only"
                onChange={() => onChange(mode.value)}
              />
              {mode.label}
            </label>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
