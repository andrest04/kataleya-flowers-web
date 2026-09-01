'use client';

import { useRouter } from 'next/navigation';
import { type Ref, useEffect, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/primitives/tooltip';
import SortableList from '@/components/ui/SortableList';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import SortableItem from '@/components/ui/SortableList/SortableItem';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { deleteDiscoverTile, toggleDiscoverTileStatus } from '@/features/admin/actions/discoverTiles';
import type { DiscoverTileRow } from '@/lib/db/rows';
import {
  HOME_DISCOVER_TILE_LIMIT,
  HOME_DISCOVER_TILE_LIMIT_COPY,
} from '@/lib/discoverTileLimit';
import { isPublished } from '@/lib/publishing';

import { useDiscoverTileReorder } from './useDiscoverTileReorder';

interface LiveDiscoverTileItem {
  description: string;
  id: string;
  title: string;
}

interface DiscoverTileListProps {
  items: DiscoverTileRow[];
  liveItems: LiveDiscoverTileItem[];
}

export default function DiscoverTileList({
  items: initialItems,
  liveItems,
}: DiscoverTileListProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pendingDelete, setPendingDelete] = useState<DiscoverTileRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const rows = items.length > 0 || initialItems.length === 0 ? items : initialItems;

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function applyOrder(orderedIds: string[]) {
    setItems((current) => {
      const source = current.length > 0 ? current : initialItems;
      const byId = new Map(source.map((item) => [item.id, item]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((item): item is DiscoverTileRow => item !== undefined);
      return reordered.length === source.length ? reordered : source;
    });
  }

  const reorder = useDiscoverTileReorder(rows, applyOrder);

  async function handleToggle(id: string, isActive: boolean) {
    const previous = rows;
    setItems(
      rows.map((item) => (item.id === id ? { ...item, is_active: isActive } : item)),
    );
    const result = await toggleDiscoverTileStatus(id, isActive);
    if (!result.success) {
      setItems(previous);
      toast.error(`No se pudo cambiar el estado: ${result.error ?? 'Error desconocido'}`);
    }
  }

  async function handleLiveToggle(id: string, isActive: boolean) {
    if (togglingId) return;
    setTogglingId(id);
    const result = await toggleDiscoverTileStatus(id, isActive);
    setTogglingId(null);
    if (!result.success) {
      toast.error(`No se pudo cambiar el estado: ${result.error ?? 'Error desconocido'}`);
      return;
    }
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const result = await deleteDiscoverTile(pendingDelete.id);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(`No se pudo eliminar: ${result.error ?? 'Error desconocido'}`);
      return;
    }
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    toast.success('Tarjeta eliminada.');
  }

  if (initialItems.length === 0) {
    if (liveItems.length === 0) {
      return (
        <EmptyState
          message="Todavía no hay tarjetas. El sitio sigue mostrando las actuales hasta que publiques una."
          action={<Button href="/admin/inicio/descubrir/nuevo" size="sm">Agregar tarjeta</Button>}
        />
      );
    }
    return (
      <ul className="space-y-3">
        {liveItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-white) p-3"
          >
            <span className="size-8 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-(--color-dark)">{item.title}</p>
              <p className="truncate text-xs text-(--color-muted)">{item.description}</p>
            </div>
            <ToggleSwitch
              checked
              disabled={togglingId !== null}
              label={`Ocultar ${item.title}`}
              onChange={(checked) => void handleLiveToggle(item.id, checked)}
            />
            <Button href={`/admin/inicio/descubrir/nuevo?from=${item.id}`} variant="ghost" size="sm">
              Editar
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled>
              Eliminar
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  const now = new Date();
  const hasVisible = rows.some((item) => isPublished(item, now));
  const activeCount = rows.filter((item) => item.is_active).length;
  const atLimit = activeCount >= HOME_DISCOVER_TILE_LIMIT;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {hasVisible ? null : (
          <p className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-dark)">
            Ninguna tarjeta está visible. Activa una para que la portada muestre Descubre Kataleya.
          </p>
        )}
        <SortableList
          ids={rows.map((item) => item.id)}
          getItemLabel={(id) => rows.find((item) => item.id === id)?.title || 'la tarjeta'}
          onReorder={(ids) => void reorder.handleReorder(ids)}
        >
          <ul className="space-y-3">
            {rows.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {({ dragHandleProps, isDragging, setNodeRef, style }) => {
                  const limited = !item.is_active && atLimit;
                  const label = `${item.is_active ? 'Ocultar' : 'Mostrar'} ${item.title}`;
                  const toggle = (
                    <ToggleSwitch
                      checked={item.is_active}
                      disabled={isDragging || limited}
                      label={limited ? `${label}. ${HOME_DISCOVER_TILE_LIMIT_COPY}` : label}
                      onChange={(checked) => void handleToggle(item.id, checked)}
                    />
                  );
                  return (
                    <li
                      ref={setNodeRef as Ref<HTMLLIElement>}
                      style={style}
                      className={`flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-white) p-3 ${
                        isPublished(item, now) ? '' : 'opacity-60'
                      }`}
                    >
                      <DragHandle handleProps={dragHandleProps} label={item.title} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-(--color-dark)">{item.title}</p>
                        <p className="truncate text-xs text-(--color-muted)">{item.description}</p>
                      </div>
                      {limited ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">{toggle}</span>
                          </TooltipTrigger>
                          <TooltipContent>{HOME_DISCOVER_TILE_LIMIT_COPY}</TooltipContent>
                        </Tooltip>
                      ) : (
                        toggle
                      )}
                      <Button href={`/admin/inicio/descubrir/${item.id}`} variant="ghost" size="sm">
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(item)}
                      >
                        Eliminar
                      </Button>
                    </li>
                  );
                }}
              </SortableItem>
            ))}
          </ul>
        </SortableList>
        <ConfirmDialog
          open={pendingDelete !== null}
          title="Eliminar tarjeta"
          description={pendingDelete ? `¿Eliminar “${pendingDelete.title}”? Esta acción no se puede deshacer.` : ''}
          loading={isDeleting}
          variant="destructive"
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </TooltipProvider>
  );
}
