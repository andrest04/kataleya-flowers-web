'use client';

import { useId } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface ProductFilterSelectProps {
  className: string;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}

export default function ProductFilterSelect({
  className,
  label,
  onChange,
  options,
  value,
}: ProductFilterSelectProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-(--color-muted)">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-white)' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
