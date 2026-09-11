'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { reorderDiscoverTiles } from '@/features/admin/actions/discoverTiles';
import type { DiscoverTileRow } from '@/lib/db/rows';

export function useDiscoverTileReorder(
  items: DiscoverTileRow[],
  applyOrder: (ids: string[]) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleReorder(orderedIds: string[]) {
    const previousIds = items.map((item) => item.id);
    applyOrder(orderedIds);
    setIsSaving(true);
    try {
      const result = await reorderDiscoverTiles(orderedIds);

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
