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
    const result = await reorderPromoPresets(orderedIds);
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
