'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export default function OptionTile({
  selected,
  disabled,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center font-body text-xs focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary)',
        disabled
          ? 'cursor-not-allowed border-(--color-border) text-(--color-muted) opacity-50'
          : 'cursor-pointer border-(--color-border) text-(--color-dark)',
        selected && !disabled && 'border-(--color-primary) bg-(--color-surface) font-semibold text-(--color-dark)',
      )}
    >
      {children}
    </label>
  );
}
