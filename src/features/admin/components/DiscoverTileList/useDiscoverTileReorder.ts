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
    const result = await reorderDiscoverTiles(orderedIds);
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
