'use client';

/**
 * DeleteModeOption — radio "tarjeta" para elegir entre los dos modos de
 * eliminación de categoría (reassign / cascade). Se usa solo dentro de
 * `DeleteCategoryDialog`.
 */

import type { DeleteMode } from './useCategoryDelete';

interface DeleteModeOptionProps {
  mode: DeleteMode;
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  /** Aplica color de énfasis (rojo) al título — para el modo cascade. */
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
