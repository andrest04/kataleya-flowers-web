'use client';

import { FieldError } from '@/features/admin/components/ProductForm/FieldError';
import { discoverIcon } from '@/features/landing/components/DiscoverMoreSection/icons';
import {
  DISCOVER_ICON_LABELS,
  DISCOVER_ICON_NAMES,
  type DiscoverIconName,
} from '@/lib/discoverIcons';

interface IconPickerProps {
  error?: string;
  idPrefix: string;
  value: string;
  onChange: (icon: DiscoverIconName) => void;
}

export default function IconPicker({
  error,
  idPrefix,
  value,
  onChange,
}: IconPickerProps) {
  const errorId = `${idPrefix}-icon-error`;

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={`${idPrefix}-icon-label`}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        {DISCOVER_ICON_NAMES.map((name) => {
          const Icon = discoverIcon(name);
          const selected = value === name;
          return (
            <label
              key={name}
              className={`flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-[transform,background-color,border-color] duration-200 ease-out focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary) active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                selected
                  ? 'border-(--color-primary) bg-(--color-surface) text-(--color-dark)'
                  : 'border-(--color-border) bg-(--color-white) text-(--color-dark)'
              }`}
            >
              <input
                type="radio"
                name={`${idPrefix}-icon`}
                value={name}
                checked={selected}
                className="sr-only"
                onChange={() => onChange(name)}
              />
              <Icon
                className="size-5 text-(--color-primary)"
                aria-hidden="true"
                strokeWidth={1.8}
              />
              <span className="text-xs">{DISCOVER_ICON_LABELS[name]}</span>
            </label>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
