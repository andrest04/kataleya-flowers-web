'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { reorderCategories } from '@/features/admin/actions/categories';
import type { CategoryRow } from '@/lib/db/rows';

export function useCategoryReorder(
  items: CategoryRow[],
  applyOrder: (ids: string[]) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleReorder(orderedIds: string[]) {
    const previousIds = items.map((item) => item.id);
    applyOrder(orderedIds);
    setIsSaving(true);
    try {
      const result = await reorderCategories(orderedIds);

      if (!result.success) {
        applyOrder(previousIds);
        toast.error(`No se pudo guardar el orden: ${result.error ?? 'Error desconocido'}`);
        return;
      }
      toast.success('Orden guardado.');
    } finally {
      setIsSaving(false);
    }
  }

  return { handleReorder, isSaving };
}
