'use client';

import type { DeleteMode } from './useCategoryDelete';

interface DeleteModeOptionProps {
  mode: DeleteMode;
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  titleEmphasis?: boolean;
}

export default function DeleteModeOption({
  mode,
  selected,
  onSelect,
  title,
  hint,
  titleEmphasis = false,
}: DeleteModeOptionProps) {
  return (
    <label
      aria-label={title}
      className="flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-colors"
      style={{
        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: selected ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'transparent',
      }}
    >
      <input
        type="radio"
        name="delete-mode"
        value={mode}
        checked={selected}
        onChange={onSelect}
        className="mt-0.5 accent-(--color-primary)"
      />
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: titleEmphasis ? 'var(--color-primary)' : 'var(--color-dark)' }}
        >
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {hint}
        </p>
      </div>
    </label>
  );
}
