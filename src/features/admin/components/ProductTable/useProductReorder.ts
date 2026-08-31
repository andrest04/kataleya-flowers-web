'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { reorderProducts } from '@/features/admin/actions/products';
import type { AdminProductListRow } from '@/features/admin/queries/products';

export function useProductReorder(
  items: AdminProductListRow[],
  applyOrder: (ids: string[]) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleReorder(orderedIds: string[]) {
    const previousIds = items.map((item) => item.id);
    applyOrder(orderedIds);
    setIsSaving(true);
    const result = await reorderProducts(orderedIds);
    setIsSaving(false);

    if (!result.success) {
      applyOrder(previousIds);
      toast.error(`No se pudo guardar el orden: ${result.error ?? 'Error desconocido'}`);
      return;
    }
    toast.success('Orden guardado.');
  }

  return { handleReorder, isSaving };
}
