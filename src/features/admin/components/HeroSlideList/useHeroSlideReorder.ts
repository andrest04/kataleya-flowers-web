'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { reorderHeroSlides } from '@/features/admin/actions/heroSlides';
import type { HeroSlideRow } from '@/lib/db/rows';

export function useHeroSlideReorder(
  items: HeroSlideRow[],
  applyOrder: (ids: string[]) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleReorder(orderedIds: string[]) {
    const previousIds = items.map((item) => item.id);
    applyOrder(orderedIds);
    setIsSaving(true);
    try {
      const result = await reorderHeroSlides(orderedIds);

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
