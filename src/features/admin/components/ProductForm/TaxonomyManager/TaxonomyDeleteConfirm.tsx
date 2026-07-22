'use client';

import { X } from 'lucide-react';

interface Props {
  readonly name: string;
  readonly label: string;
  readonly usageCount: number | null;
  readonly capitalizePill?: boolean;
  readonly onConfirm: (name: string) => void;
  readonly onCancel: () => void;
}

export default function TaxonomyDeleteConfirm({
  name,
  label,
  usageCount,
  capitalizePill,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 rounded-full px-3 py-1 text-sm border"
      style={{
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
        background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-white))',
      }}
    >
      <span className={capitalizePill ? 'capitalize' : ''}>{label}</span>
      {usageCount !== null && usageCount > 0 && (
        <span className="text-xs">
          ({usageCount} producto{usageCount !== 1 ? 's' : ''})
        </span>
      )}
      <button
        type="button"
        onClick={() => onConfirm(name)}
        className="text-xs font-medium underline"
      >
        Confirmar
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs"
        aria-label="Cancelar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
