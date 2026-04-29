'use client';

/**
 * useCategoryDelete — flujo de eliminación de categoría con dos modos:
 * `reassign` (mover productos a otra categoría) y `cascade` (borrar todo).
 *
 * Maneja:
 * - Fetch del conteo de productos para decidir si pedir confirmación elaborada.
 * - Estado del dialog primario y del segundo confirm cuando es cascade.
 * - Reset completo al cerrar o al terminar.
 */

import { useState } from 'react';
import { toast } from 'sonner';

import {
  deleteCategory,
  getCategoryProductCount,
} from '@/features/admin/actions/categories';

export type DeleteMode = 'reassign' | 'cascade';

export interface DeleteTarget {
  id: string;
  name: string;
  productCount: number;
}

interface UseCategoryDeleteParams {
  onDeleted: (id: string) => void;
}

interface UseCategoryDeleteResult {
  deletingId: string | null;
  deleteTarget: DeleteTarget | null;
  deleteMode: DeleteMode;
  reassignTo: string;
  showCascadeConfirm: boolean;
  setDeleteMode: (mode: DeleteMode) => void;
  setReassignTo: (id: string) => void;
  requestDelete: (id: string, name: string) => Promise<void>;
  confirmDelete: () => void;
  executeCascade: () => void;
  cancelDelete: () => void;
}

export function useCategoryDelete({
  onDeleted,
}: UseCategoryDeleteParams): UseCategoryDeleteResult {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('reassign');
  const [reassignTo, setReassignTo] = useState<string>('');
  const [showCascadeConfirm, setShowCascadeConfirm] = useState(false);

  function reset() {
    setDeleteTarget(null);
    setReassignTo('');
    setDeleteMode('reassign');
    setShowCascadeConfirm(false);
  }

  async function requestDelete(id: string, name: string): Promise<void> {
    const result = await getCategoryProductCount(id);
    // CountResult es `{ count } | (AdminActionFailure & { count: 0 })` — el
    // discriminante es `success: false` en la rama de error.
    if ('success' in result && result.success === false) {
      toast.error(`No se pudo verificar productos: ${result.error}`);
      return;
    }
    setReassignTo('');
    setDeleteMode('reassign');
    setShowCascadeConfirm(false);
    setDeleteTarget({ id, name, productCount: result.count });
  }

  async function executeDelete(mode: DeleteMode) {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const result = await deleteCategory(
      deleteTarget.id,
      mode,
      mode === 'reassign' && deleteTarget.productCount > 0 ? reassignTo : undefined,
    );
    if (!result.success) {
      toast.error(`Error al eliminar: ${result.error ?? 'Error desconocido'}`);
    } else {
      onDeleted(deleteTarget.id);
    }
    setDeletingId(null);
    reset();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.productCount === 0) {
      void executeDelete('reassign');
      return;
    }
    if (deleteMode === 'reassign') {
      if (!reassignTo) return;
      void executeDelete('reassign');
      return;
    }
    setShowCascadeConfirm(true);
  }

  function executeCascade() {
    void executeDelete('cascade');
  }

  return {
    deletingId,
    deleteTarget,
    deleteMode,
    reassignTo,
    showCascadeConfirm,
    setDeleteMode,
    setReassignTo,
    requestDelete,
    confirmDelete,
    executeCascade,
    cancelDelete: reset,
  };
}
