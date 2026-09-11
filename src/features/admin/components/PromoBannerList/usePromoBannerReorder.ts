'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { reorderPromoPresets } from '@/features/admin/actions/promoBanners';

export function usePromoBannerReorder(
  keys: string[],
  applyOrder: (ids: string[]) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleReorder(orderedIds: string[]) {
    const previousIds = keys;
    applyOrder(orderedIds);
    setIsSaving(true);
    try {
      const result = await reorderPromoPresets(orderedIds);

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
