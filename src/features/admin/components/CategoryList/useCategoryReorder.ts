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
    const result = await reorderCategories(orderedIds);
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
