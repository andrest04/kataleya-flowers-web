'use client';

import { move } from '@dnd-kit/helpers';
import type { DragDropEvents } from '@dnd-kit/react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { reorderCategories } from '@/features/admin/actions/categories';
import type { CategoryRow } from '@/lib/db/rows';
type DragEndHandler = NonNullable<DragDropEvents['dragend']>;

interface UseCategoryReorderResult {
  items: CategoryRow[];
  setItems: (next: CategoryRow[]) => void;
  hasChanges: boolean;
  isSaving: boolean;
  handleDragEnd: DragEndHandler;
  handleSave: () => void;
  handleCancel: () => void;
}

export function useCategoryReorder(initial: CategoryRow[]): UseCategoryReorderResult {
  const [items, setItems] = useState<CategoryRow[]>(initial);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const lastSavedRef = useRef<CategoryRow[]>(initial);

  const handleDragEnd: DragEndHandler = (event) => {
    if (event.canceled) return;
    const nextItems = move(items, event);
    setItems(nextItems);
    setHasChanges(true);
  };

  function handleSave() {
    const orderedIds = items.map((c) => c.id);
    startTransition(async () => {
      const result = await reorderCategories(orderedIds);
      if (!result.success) {
        toast.error(`Error al reordenar: ${result.error ?? 'Error desconocido'}`);
        setItems(lastSavedRef.current);
      } else {
        lastSavedRef.current = items;
      }
      setHasChanges(false);
    });
  }

  function handleCancel() {
    setItems(lastSavedRef.current);
    setHasChanges(false);
  }

  return { items, setItems, hasChanges, isSaving, handleDragEnd, handleSave, handleCancel };
}
