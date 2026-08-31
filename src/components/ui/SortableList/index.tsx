'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ReactNode } from 'react';

import { createSortableAnnouncements, sortableScreenReaderInstructions } from './announcements';

interface SortableListProps {
  children: ReactNode;
  getItemLabel: (id: string) => string;
  ids: string[];
  layout?: 'vertical' | 'grid';
  onReorder: (ids: string[]) => void;
}

export default function SortableList({
  children,
  getItemLabel,
  ids,
  layout = 'vertical',
  onReorder,
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(ids, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={layout === 'vertical' ? [restrictToVerticalAxis, restrictToParentElement] : []}
      accessibility={{
        announcements: createSortableAnnouncements(getItemLabel),
        screenReaderInstructions: sortableScreenReaderInstructions,
        // Portal the live region out of the list. When the list is a <tbody>,
        // rendering it in place would put a <div> inside a table body.
        container: typeof document === 'undefined' ? undefined : document.body,
      }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={layout === 'vertical' ? verticalListSortingStrategy : rectSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
