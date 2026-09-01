'use client';

import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  handleProps: Record<string, unknown>;
  label: string;
}

export default function DragHandle({ handleProps, label }: DragHandleProps) {
  return (
    <button
      type="button"
      aria-label={`Reordenar ${label}`}
      className="flex size-8 cursor-grab touch-none items-center justify-center rounded-lg text-(--color-muted) transition-colors hover:bg-(--color-surface) hover:text-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) active:cursor-grabbing"
      {...handleProps}
    >
      <GripVertical className="size-4" aria-hidden="true" strokeWidth={1.8} />
    </button>
  );
}
