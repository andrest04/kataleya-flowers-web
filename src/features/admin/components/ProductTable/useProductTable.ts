'use client';

/**
 * useProductTable — orquesta los efectos colaterales del listado de productos:
 * toggle de status optimista (con rollback si falla), eliminación con dialog,
 * y reorder drag-and-drop con `@dnd-kit/react`.
 */

import { move } from '@dnd-kit/helpers';
import type { DragDropEvents } from '@dnd-kit/react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  deleteProduct,
  reorderProducts,
  toggleProductStatus,
} from '@/features/admin/actions/products';
import type { AdminProductRow } from '@/features/admin/queries/products';
import type { AdminProductFilter } from '@/features/admin/utils/adminFilters';

type DragEndHandler = NonNullable<DragDropEvents['dragend']>;

function matchesActiveFilter(
  product: AdminProductRow,
  filter: AdminProductFilter | null | undefined,
  viewedProductIds: Set<string>,
): boolean {
  switch (filter) {
    case 'missing-gallery':
      // <= 1 means only the primary (or no images at all) — no gallery
      return product.is_active && (product.product_images?.length ?? 0) <= 1;
    case 'featured-without-views':
      return product.is_featured && !viewedProductIds.has(product.id);
    case 'active-without-views':
      return product.is_active && !viewedProductIds.has(product.id);
    default:
      return true;
  }
}

interface UseProductTableParams {
  initial: AdminProductRow[];
  activeFilter: AdminProductFilter | null;
  viewedProductIds: Set<string>;
}

export interface DeleteTarget {
  id: string;
  name: string;
}

export function useProductTable({ initial, activeFilter, viewedProductIds }: UseProductTableParams) {
  const [items, setItems] = useState<AdminProductRow[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const lastSavedRef = useRef<AdminProductRow[]>(initial);

  async function handleToggleStatus(id: string, isActive: boolean) {
    const previousItems = items;
    const nextItems = items
      .map((product) => (product.id === id ? { ...product, is_active: isActive } : product))
      .filter((product) => matchesActiveFilter(product, activeFilter, viewedProductIds));
    setItems(nextItems);

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
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeletingId(null);
    setDeleteTarget(null);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  const handleDragEnd: DragEndHandler = (event) => {
    if (event.canceled) return;
    setItems(move(items, event));
    setHasChanges(true);
  };

  function handleSave() {
    const orderedIds = items.map((p) => p.id);
    startTransition(async () => {
      const result = await reorderProducts(orderedIds);
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

  return {
    items,
    deletingId,
    deleteTarget,
    hasChanges,
    isSaving,
    handleToggleStatus,
    requestDelete,
    confirmDelete,
    cancelDelete,
    handleDragEnd,
    handleSave,
    handleCancel,
  };
}
