'use client';

import { Grid3x3 } from 'lucide-react';

import { cn } from '@/lib/utils';

export type CatalogDensity = 2 | 3 | 4;

interface CatalogDensityToggleProps {
  density: CatalogDensity;
  onDensityChange: (density: CatalogDensity) => void;
}

const OPTIONS: { value: CatalogDensity; label: string; iconSize: number }[] = [
  { value: 2, label: 'Vista amplia', iconSize: 22 },
  { value: 3, label: 'Vista media', iconSize: 19 },
  { value: 4, label: 'Vista compacta', iconSize: 16 },
];

export default function CatalogDensityToggle({
  density,
  onDensityChange,
}: CatalogDensityToggleProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Densidad de la grilla">
      {OPTIONS.map((option) => {
        const selected = density === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={selected}
            onClick={() => onDensityChange(option.value)}
            className={cn(
              'flex size-9 cursor-pointer items-center justify-center rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)',
              selected
                ? 'bg-(--color-surface) text-(--color-dark)'
                : 'text-(--color-muted) hover:bg-(--color-surface)',
            )}
          >
            <Grid3x3 size={option.iconSize} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
