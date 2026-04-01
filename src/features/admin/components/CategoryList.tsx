'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';
import type { Database } from '@/lib/supabase/types';
import { deleteCategory, reorderCategories } from '@/features/admin/actions/categories';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface CategoryListProps {
  categories: CategoryRow[];
}

interface SortableRowProps {
  category: CategoryRow;
  index: number;
  deletingId: string | null;
  hasChanges: boolean;
  onDelete: (id: string, name: string) => void;
}

function SortableRow({ category, index, deletingId, hasChanges, onDelete }: SortableRowProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: category.id, index });

  return (
    <div
      ref={ref}
      className="flex items-center gap-4 px-4 py-3 transition-colors"
      style={{
        background: isDragging ? 'var(--color-surface)' : 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      {/* Drag handle — only this triggers drag */}
      <button
        ref={handleRef}
        type="button"
        className="flex items-center justify-center w-6 h-6 rounded flex-shrink-0 transition-colors hover:bg-[var(--color-surface)]"
        style={{ color: 'var(--color-muted)', cursor: 'grab', touchAction: 'none' }}
        aria-label="Arrastrar para reordenar"
      >
        <span className="text-sm leading-none">⠿</span>
      </button>

      {/* Order number */}
      <span
        className="text-xs font-mono w-5 text-center flex-shrink-0"
        style={{ color: 'var(--color-muted)' }}
      >
        {index + 1}
      </span>

      {/* Image */}
      <div
        className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
          </div>
        )}
      </div>

      {/* Name + slug */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--color-dark)' }}>
          {category.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
          {category.slug}
        </p>
      </div>

      {/* Occasion */}
      <span className="text-sm hidden md:block w-28 truncate" style={{ color: 'var(--color-dark)' }}>
        {category.occasion ?? '—'}
      </span>

      {/* Status */}
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
        style={{
          background: category.is_active
            ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
            : 'color-mix(in srgb, var(--color-muted) 15%, transparent)',
          color: category.is_active ? 'var(--color-accent)' : 'var(--color-muted)',
        }}
      >
        {category.is_active ? 'Activa' : 'Inactiva'}
      </span>

      {/* Actions — hidden while pending changes */}
      {!hasChanges && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/admin/categorias/${category.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          >
            Editar
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id, category.name);
            }}
            disabled={deletingId === category.id}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
            }}
          >
            {deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CategoryList({ categories: initialCategories }: CategoryListProps) {
  const [items, setItems] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startTransition] = useTransition();

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Eliminar la categoría "${name}"? Los productos asociados quedarán sin categoría.`)) {
      return;
    }
    setDeletingId(id);
    const result = await deleteCategory(id);
    if (!result.success) {
      alert(`Error al eliminar: ${result.error ?? 'Error desconocido'}`);
    } else {
      setItems((prev) => prev.filter((c) => c.id !== id));
    }
    setDeletingId(null);
  }

  function handleDragEnd(event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0]) {
    if (event.canceled) return;

    const newItems = move(items, event);
    setItems(newItems);
    setHasChanges(true);
  }

  function handleSave() {
    const orderedIds = items.map((c) => c.id);
    startTransition(async () => {
      const result = await reorderCategories(orderedIds);
      if (!result.success) {
        alert(`Error al reordenar: ${result.error ?? 'Error desconocido'}`);
        setItems(initialCategories);
      }
      setHasChanges(false);
    });
  }

  function handleCancel() {
    setItems(initialCategories);
    setHasChanges(false);
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          No hay categorías aún. ¡Creá la primera!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-4 py-3 text-xs font-semibold"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-dark)',
          }}
        >
          <span className="w-6 flex-shrink-0" />
          <span className="w-5 flex-shrink-0">#</span>
          <span className="w-10 flex-shrink-0">Imagen</span>
          <span className="flex-1">Nombre</span>
          <span className="hidden md:block w-28">Ocasión</span>
          <span className="w-16">Estado</span>
          {!hasChanges && <span className="w-36 text-right">Acciones</span>}
        </div>

        {/* Sortable list */}
        <DragDropProvider onDragEnd={handleDragEnd}>
          {items.map((category, index) => (
            <SortableRow
              key={category.id}
              category={category}
              index={index}
              deletingId={deletingId}
              hasChanges={hasChanges}
              onDelete={handleDelete}
            />
          ))}
        </DragDropProvider>
      </div>

      {/* Confirm / Cancel bar */}
      {hasChanges && (
        <div
          className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--color-secondary) 10%, var(--color-cream))',
            border: '1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-dark)' }}>
            Orden modificado — ¿guardar cambios?
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-dark)',
                border: '1px solid var(--color-border)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-white)',
              }}
            >
              {isSaving ? 'Guardando…' : 'Guardar orden'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
