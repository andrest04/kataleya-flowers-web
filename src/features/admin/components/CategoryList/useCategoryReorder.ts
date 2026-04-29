'use client';

/**
 * useCategoryReorder — encapsula el reordenamiento drag-and-drop con
 * `@dnd-kit/react` + helper `move`. Mantiene snapshot del último orden guardado
 * para hacer rollback correcto si una segunda corrida falla, en lugar de
 * volver al snapshot inicial de página.
 */

import { move } from '@dnd-kit/helpers';
import type { DragDropEvents } from '@dnd-kit/react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { reorderCategories } from '@/features/admin/actions/categories';
import type { Database } from '@/lib/supabase/types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
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
  // Snapshot del último orden persistido — tras un save exitoso se actualiza,
  // por lo que el rollback siempre lleva al último estado seguro.
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
