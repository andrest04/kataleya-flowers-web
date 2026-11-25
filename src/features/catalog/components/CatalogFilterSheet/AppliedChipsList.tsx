'use client';

import { X } from 'lucide-react';

export default function AppliedChipsList({
  chips,
}: {
  chips: { key: string; label: string; onRemove: () => void }[];
}) {
  if (chips.length === 0) return null;
  return (
    <div className="border-b border-(--color-border) pb-4">
      <p className="mb-3 font-body text-sm font-semibold text-(--color-dark)">
        Filtros aplicados
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-body text-xs font-semibold text-(--color-dark) transition-colors hover:bg-(--color-dark)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            {chip.label}
            <X className="size-3" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
