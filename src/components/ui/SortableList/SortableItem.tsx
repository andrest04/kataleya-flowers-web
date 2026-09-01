'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, ReactNode, Ref } from 'react';

export interface SortableItemRenderProps {
  dragHandleProps: Record<string, unknown>;
  isDragging: boolean;
  setNodeRef: Ref<HTMLElement>;
  style: CSSProperties;
}

interface SortableItemProps {
  children: (props: SortableItemRenderProps) => ReactNode;
  id: string;
}

export default function SortableItem({ children, id }: SortableItemProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return children({
    dragHandleProps: { ...attributes, ...listeners },
    isDragging,
    setNodeRef: setNodeRef as Ref<HTMLElement>,
    style: {
      opacity: isDragging ? 0.6 : 1,
      position: 'relative',
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1 : undefined,
    },
  });
}
