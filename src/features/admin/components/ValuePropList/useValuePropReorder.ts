'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { reorderValueProps } from '@/features/admin/actions/valueProps';
import type { ValuePropRow } from '@/lib/db/rows';

export function useValuePropReorder(
  items: ValuePropRow[],
  applyOrder: (ids: string[]) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleReorder(orderedIds: string[]) {
    const previousIds = items.map((item) => item.id);
    applyOrder(orderedIds);
    setIsSaving(true);
    try {
      const result = await reorderValueProps(orderedIds);

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
