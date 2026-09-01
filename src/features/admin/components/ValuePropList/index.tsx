'use client';

import { useRouter } from 'next/navigation';
import { type Ref, useEffect, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import SortableList from '@/components/ui/SortableList';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import SortableItem from '@/components/ui/SortableList/SortableItem';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { deleteValueProp, toggleValuePropStatus } from '@/features/admin/actions/valueProps';
import type { ValuePropRow } from '@/lib/db/rows';
import { isPublished } from '@/lib/publishing';
import {
  HOME_VALUE_PROP_LIMIT,
  HOME_VALUE_PROP_LIMIT_COPY,
} from '@/lib/valuePropLimit';

import { useValuePropReorder } from './useValuePropReorder';

interface LiveValuePropItem {
  description: string;
  id: string;
  title: string;
}

interface ValuePropListProps {
  items: ValuePropRow[];
  liveItems: LiveValuePropItem[];
}

export default function ValuePropList({
  items: initialItems,
  liveItems,
}: ValuePropListProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pendingDelete, setPendingDelete] = useState<ValuePropRow | null>(null);
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
        .filter((item): item is ValuePropRow => item !== undefined);
      return reordered.length === source.length ? reordered : source;
    });
  }

  const reorder = useValuePropReorder(rows, applyOrder);

  async function handleToggle(id: string, isActive: boolean) {
    const previous = rows;
    setItems(
      rows.map((item) => (item.id === id ? { ...item, is_active: isActive } : item)),
    );
    const result = await toggleValuePropStatus(id, isActive);
    if (!result.success) {
      setItems(previous);
      toast.error(`No se pudo cambiar el estado: ${result.error ?? 'Error desconocido'}`);
    }
  }

  async function handleLiveToggle(id: string, isActive: boolean) {
    if (togglingId) return;
    setTogglingId(id);
    const result = await toggleValuePropStatus(id, isActive);
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
    const result = await deleteValueProp(pendingDelete.id);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(`No se pudo eliminar: ${result.error ?? 'Error desconocido'}`);
      return;
    }
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    toast.success('Destacado eliminado.');
  }

  if (initialItems.length === 0) {
    if (liveItems.length === 0) {
      return (
        <EmptyState
          message="Todavía no hay destacados. El sitio sigue mostrando los actuales hasta que publiques uno."
          action={<Button href="/admin/inicio/destacados/nuevo" size="sm">Agregar destacado</Button>}
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
            <Button href={`/admin/inicio/destacados/nuevo?from=${item.id}`} variant="ghost" size="sm">
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
  const atLimit = activeCount >= HOME_VALUE_PROP_LIMIT;
  const showLimitNote = rows.length > HOME_VALUE_PROP_LIMIT || (atLimit && rows.some((item) => !item.is_active));

  return (
    <div className="space-y-3">
      {hasVisible ? null : (
        <p className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-dark)">
          Ningún destacado está visible. Activa uno para que el sitio muestre esta franja.
        </p>
      )}
      {showLimitNote ? (
        <p className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-dark)">
          {HOME_VALUE_PROP_LIMIT_COPY}
        </p>
      ) : null}
      <SortableList
        ids={rows.map((item) => item.id)}
        getItemLabel={(id) => rows.find((item) => item.id === id)?.title || 'el destacado'}
        onReorder={(ids) => void reorder.handleReorder(ids)}
      >
        <ul className="space-y-3">
          {rows.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {({ dragHandleProps, isDragging, setNodeRef, style }) => (
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
                  <ToggleSwitch
                    checked={item.is_active}
                    disabled={isDragging || (!item.is_active && atLimit)}
                    label={`${item.is_active ? 'Ocultar' : 'Mostrar'} ${item.title}`}
                    onChange={(checked) => void handleToggle(item.id, checked)}
                  />
                  <Button href={`/admin/inicio/destacados/${item.id}`} variant="ghost" size="sm">
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
              )}
            </SortableItem>
          ))}
        </ul>
      </SortableList>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar destacado"
        description={pendingDelete ? `¿Eliminar “${pendingDelete.title}”? Esta acción no se puede deshacer.` : ''}
        loading={isDeleting}
        variant="destructive"
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
