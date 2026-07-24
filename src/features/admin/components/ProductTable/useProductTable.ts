'use client';

import { move } from '@dnd-kit/helpers';
import type { DragDropEvents } from '@dnd-kit/react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  deleteProduct,
  reorderProducts,
  toggleProductStatus,
} from '@/features/admin/actions/products';
import type { AdminProductListRow } from '@/features/admin/queries/products';

type DragEndHandler = NonNullable<DragDropEvents['dragend']>;

interface UseProductTableParams {
  initial: AdminProductListRow[];
  reorderCategoryId?: string;
}

export interface DeleteTarget {
  id: string;
  name: string;
}

export function useProductTable({ initial, reorderCategoryId }: UseProductTableParams) {
  const [items, setItems] = useState<AdminProductListRow[]>(initial);
  const [previousInitial, setPreviousInitial] = useState(initial);
  const [lastSavedItems, setLastSavedItems] = useState<AdminProductListRow[]>(initial);
  const [originalOrderIds, setOriginalOrderIds] = useState(() => initial.map((product) => product.id));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startTransition] = useTransition();

  if (initial !== previousInitial) {
    setPreviousInitial(initial);
    setItems(initial);
    setHasChanges(false);
    setLastSavedItems(initial);
    setOriginalOrderIds(initial.map((product) => product.id));
  }

  async function handleToggleStatus(id: string, isActive: boolean) {
    const previousItems = items;
    setItems((current) => current.map((product) => product.id === id ? { ...product, is_active: isActive } : product));
    const result = await toggleProductStatus(id, isActive);
    if (!result.success) {
      setItems(previousItems);
      toast.error(`Error al cambiar estado: ${result.error ?? 'Error desconocido'}`);
    }
  }

  function requestDelete(target: DeleteTarget) {
    setDeleteTarget(target);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const result = await deleteProduct(deleteTarget.id);
    if (!result.success) {
      toast.error(`Error al eliminar: ${result.error ?? 'Error desconocido'}`);
    } else {
      setItems((current) => current.filter((product) => product.id !== deleteTarget.id));
      if (result.cleanupWarning) toast.warning(result.cleanupWarning);
    }
    setDeletingId(null);
    setDeleteTarget(null);
  }

  const handleDragEnd: DragEndHandler = (event) => {
    if (event.canceled) return;
    setItems(move(items, event));
    setHasChanges(true);
  };

  function handleSave() {
    if (!reorderCategoryId) {
      toast.error('No se pudo identificar la categoría a reordenar.');
      return;
    }
    const orderedIds = items.map((product) => product.id);
    startTransition(async () => {
      const result = await reorderProducts(reorderCategoryId, orderedIds, originalOrderIds);
      if (!result.success) {
        toast.error(`Error al reordenar: ${result.error ?? 'Error desconocido'}`);
        setItems(lastSavedItems);
      } else {
        setLastSavedItems(items);
        setOriginalOrderIds(items.map((product) => product.id));
      }
      setHasChanges(false);
    });
  }

  return {
    items,
    deletingId,
    deleteTarget,
    hasChanges,
    isSaving,
    handleToggleStatus,
    requestDelete,
    confirmDelete,
    cancelDelete: () => setDeleteTarget(null),
    handleDragEnd,
    handleSave,
    handleCancel: () => {
      setItems(lastSavedItems);
      setHasChanges(false);
    },
  };
}
