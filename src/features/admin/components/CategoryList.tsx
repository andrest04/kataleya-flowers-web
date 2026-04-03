'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';
import type { Database } from '@/lib/supabase/types';
import { deleteCategory, getCategoryProductCount, reorderCategories, toggleCategoryStatus } from '@/features/admin/actions/categories';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import EmptyState from '@/components/ui/EmptyState';

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
  onToggleStatus: (id: string, isActive: boolean) => void;
}

function SortableRow({ category, index, deletingId, hasChanges, onDelete, onToggleStatus }: SortableRowProps) {
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

      {/* Status toggle */}
      <ToggleSwitch
        checked={category.is_active}
        label={`${category.is_active ? 'Desactivar' : 'Activar'} ${category.name}`}
        onChange={(checked) => onToggleStatus(category.id, checked)}
      />

      {/* Actions — hidden while pending changes */}
      {!hasChanges && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" href={`/admin/categorias/${category.id}`}>
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id, category.name);
            }}
            disabled={deletingId === category.id}
          >
            {deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CategoryList({ categories: initialCategories }: CategoryListProps) {
  const [items, setItems] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; productCount: number } | null>(null);
  const [deleteMode, setDeleteMode] = useState<'reassign' | 'cascade'>('reassign');
  const [reassignTo, setReassignTo] = useState<string>('');
  const [showCascadeConfirm, setShowCascadeConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startTransition] = useTransition();

  async function handleDeleteRequest(id: string, name: string) {
    const { count } = await getCategoryProductCount(id);
    setReassignTo('');
    setDeleteMode('reassign');
    setShowCascadeConfirm(false);
    setDeleteTarget({ id, name, productCount: count });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    // No products → delete directly
    if (deleteTarget.productCount === 0) {
      void executeDelete('reassign');
      return;
    }

    // Reassign mode → needs a target category selected
    if (deleteMode === 'reassign') {
      if (!reassignTo) return;
      void executeDelete('reassign');
      return;
    }

    // Cascade mode → show second confirmation
    setShowCascadeConfirm(true);
  }

  async function executeDelete(mode: 'reassign' | 'cascade') {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const result = await deleteCategory(
      deleteTarget.id,
      mode,
      mode === 'reassign' && deleteTarget.productCount > 0 ? reassignTo : undefined,
    );
    if (!result.success) {
      alert(`Error al eliminar: ${result.error ?? 'Error desconocido'}`);
    } else {
      setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    }
    setDeletingId(null);
    setDeleteTarget(null);
    setReassignTo('');
    setDeleteMode('reassign');
    setShowCascadeConfirm(false);
  }

  function handleDeleteCancel() {
    setDeleteTarget(null);
    setReassignTo('');
    setDeleteMode('reassign');
    setShowCascadeConfirm(false);
  }

  async function handleToggleStatus(id: string, isActive: boolean) {
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: isActive } : c)),
    );
    const result = await toggleCategoryStatus(id, isActive);
    if (!result.success) {
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !isActive } : c)),
      );
    }
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
    return <EmptyState message="No hay categorías aún. ¡Creá la primera!" />;
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
          <span className="w-12">Estado</span>
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
              onDelete={handleDeleteRequest}
              onToggleStatus={(id, checked) => void handleToggleStatus(id, checked)}
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
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar orden'}
            </Button>
          </div>
        </div>
      )}

      {/* Primary delete dialog */}
      <ConfirmDialog
        open={deleteTarget !== null && !showCascadeConfirm}
        title="Eliminar categoría"
        description={
          deleteTarget
            ? deleteTarget.productCount > 0
              ? `La categoría "${deleteTarget.name}" tiene ${deleteTarget.productCount} producto${deleteTarget.productCount !== 1 ? 's' : ''}.`
              : `¿Eliminar la categoría "${deleteTarget.name}"?`
            : ''
        }
        confirmLabel={
          !deleteTarget || deleteTarget.productCount === 0
            ? 'Eliminar'
            : deleteMode === 'reassign'
              ? 'Mover y eliminar'
              : 'Eliminar todo'
        }
        confirmDisabled={
          deleteTarget !== null &&
          deleteTarget.productCount > 0 &&
          deleteMode === 'reassign' &&
          !reassignTo
        }
        loading={deletingId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget && deleteTarget.productCount > 0 && (
          <div className="space-y-3">
            {/* Option: Reassign */}
            <label
              aria-label="Mover productos a otra categoría"
              className="flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-colors"
              style={{
                border: `1px solid ${deleteMode === 'reassign' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: deleteMode === 'reassign' ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="delete-mode"
                value="reassign"
                checked={deleteMode === 'reassign'}
                onChange={() => setDeleteMode('reassign')}
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
                  Mover productos a otra categoría
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Los productos se reasignan antes de eliminar la categoría
                </p>
              </div>
            </label>

            {/* Reassign select (visible only when reassign is selected) */}
            {deleteMode === 'reassign' && (
              <select
                id="reassign-category"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-white)',
                  color: 'var(--color-dark)',
                }}
              >
                <option value="">Seleccionar categoría…</option>
                {items
                  .filter((c) => c.id !== deleteTarget.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            )}

            {/* Option: Cascade */}
            <label
              aria-label="Eliminar categoría y todos sus productos"
              className="flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-colors"
              style={{
                border: `1px solid ${deleteMode === 'cascade' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: deleteMode === 'cascade' ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="delete-mode"
                value="cascade"
                checked={deleteMode === 'cascade'}
                onChange={() => setDeleteMode('cascade')}
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                  Eliminar categoría y todos sus productos
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Se eliminarán permanentemente {deleteTarget.productCount} producto{deleteTarget.productCount !== 1 ? 's' : ''}
                </p>
              </div>
            </label>
          </div>
        )}
      </ConfirmDialog>

      {/* Second confirmation for cascade delete */}
      <ConfirmDialog
        open={showCascadeConfirm}
        title="¿Estás seguro?"
        description={
          deleteTarget
            ? `Se eliminará la categoría "${deleteTarget.name}" junto con ${deleteTarget.productCount} producto${deleteTarget.productCount !== 1 ? 's' : ''} de forma permanente. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, eliminar todo"
        loading={deletingId !== null}
        onConfirm={() => void executeDelete('cascade')}
        onCancel={() => setShowCascadeConfirm(false)}
      />
    </div>
  );
}
