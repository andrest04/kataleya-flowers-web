'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { bulkDeleteProducts, bulkSetProductStatus } from '@/features/admin/actions/products';
import type { AdminProductListRow } from '@/features/admin/queries/products';

export function useProductSelection(products: AdminProductListRow[]) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const visibleIds = products.map((product) => product.id);
  const [previousProducts, setPreviousProducts] = useState(products);

  if (products !== previousProducts) {
    setPreviousProducts(products);
    setSelectedIds((current) => current.filter((id) => visibleIds.includes(id)));
  }

  const selectedCount = selectedIds.length;
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;

  function toggleOne(id: string, selected: boolean) {
    setSelectedIds((current) =>
      selected ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  }

  function toggleAll(selected: boolean) {
    setSelectedIds(selected ? visibleIds : []);
  }

  function finish(result: { success: boolean; error?: string; cleanupWarning?: string }, successMessage: string) {
    if (!result.success) {
      toast.error(result.error ?? 'Error desconocido');
      return;
    }
    if (result.cleanupWarning) toast.warning(result.cleanupWarning);
    toast.success(successMessage);
    setSelectedIds([]);
    startTransition(() => router.refresh());
  }

  async function setStatus(isActive: boolean) {
    const count = selectedIds.length;
    const result = await bulkSetProductStatus(selectedIds, isActive);
    finish(
      result,
      `${count} producto${count !== 1 ? 's' : ''} ${isActive ? 'publicado' : 'oculto'}${count !== 1 ? 's' : ''}.`,
    );
  }

  async function confirmDelete() {
    const count = selectedIds.length;
    const result = await bulkDeleteProducts(selectedIds);
    setConfirmingDelete(false);
    finish(result, `${count} producto${count !== 1 ? 's' : ''} eliminado${count !== 1 ? 's' : ''}.`);
  }

  return {
    allSelected,
    confirmDelete,
    confirmingDelete,
    isPending,
    isSelected: (id: string) => selectedIds.includes(id),
    requestDelete: () => setConfirmingDelete(true),
    cancelDelete: () => setConfirmingDelete(false),
    selectedCount,
    setStatus,
    toggleAll,
    toggleOne,
  };
}
