'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { deleteProduct, toggleProductStatus } from '@/features/admin/actions/products';
import type { AdminProductListRow } from '@/features/admin/queries/products';

export interface DeleteTarget {
  id: string;
  name: string;
}

export function useProductTable(initial: AdminProductListRow[]) {
  const [items, setItems] = useState<AdminProductListRow[]>(initial);
  const [previousInitial, setPreviousInitial] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (initial !== previousInitial) {
    setPreviousInitial(initial);
    setItems(initial);
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

  return {
    items,
    deletingId,
    deleteTarget,
    handleToggleStatus,
    requestDelete,
    confirmDelete,
    cancelDelete: () => setDeleteTarget(null),
  };
}
