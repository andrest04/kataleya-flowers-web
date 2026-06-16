'use client';

/**
 * CategoryList — listado admin de categorías con drag-and-drop, toggles y
 * eliminación con dos modos (reassign / cascade).
 *
 * Composición: la lógica vive en hooks (`useCategoryReorder`,
 * `useCategoryDelete`) y los pedazos visuales en componentes hermanos.
 *
 * Nota a11y: el plugin `Accessibility` por defecto de @dnd-kit lee los IDs
 * (UUIDs) — para que NVDA/JAWS lean el nombre de la categoría usamos un
 * `<DndLiveRegion>` propio alimentado por `useDndAccessibility`.
 */

import { DragDropProvider } from '@dnd-kit/react';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useDndAccessibility } from '@/features/admin/hooks/useDndAccessibility';
import type { CategoryRow } from '@/lib/db/rows';

import DndLiveRegion from '../DndLiveRegion';
import SaveOrderBar from '../SaveOrderBar';
import CategoryListHeader from './CategoryListHeader';
import CategoryRowItem from './CategoryRow';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useCategoryDelete } from './useCategoryDelete';
import { useCategoryReorder } from './useCategoryReorder';

interface CategoryListProps {
  categories: CategoryRow[];
  emptyMessage?: string;
  clearFilterHref?: string;
}

export default function CategoryList({
  categories: initialCategories,
  emptyMessage,
  clearFilterHref,
}: CategoryListProps) {
  const reorder = useCategoryReorder(initialCategories);
  const deletion = useCategoryDelete({
    onDeleted: (id) => reorder.setItems(reorder.items.filter((c) => c.id !== id)),
  });
  const dndA11y = useDndAccessibility(reorder.items, (c) => c.name);

  function applyToggleStatus(id: string, isActive: boolean) {
    reorder.setItems(reorder.items.map((c) => (c.id === id ? { ...c, is_active: isActive } : c)));
  }

  function applyToggleFeatured(id: string, isFeatured: boolean) {
    reorder.setItems(reorder.items.map((c) => (c.id === id ? { ...c, is_featured: isFeatured } : c)));
  }

  if (reorder.items.length === 0) {
    return (
      <EmptyState
        message={emptyMessage ?? 'No hay categorías aún. ¡Creá la primera!'}
        action={
          clearFilterHref ? (
            <Button href={clearFilterHref} variant="ghost" size="sm">
              Ver todas las categorías
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div>
      <DndLiveRegion message={dndA11y.message} />

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <CategoryListHeader hasChanges={reorder.hasChanges} />

        <DragDropProvider
          onDragStart={dndA11y.onDragStart}
          onDragOver={dndA11y.onDragOver}
          onDragEnd={(event, manager) => {
            dndA11y.onDragEnd(event, manager);
            reorder.handleDragEnd(event, manager);
          }}
        >
          {reorder.items.map((category, index) => (
            <CategoryRowItem
              key={category.id}
              category={category}
              index={index}
              deletingId={deletion.deletingId}
              hasChanges={reorder.hasChanges}
              onDelete={(id, name) => void deletion.requestDelete(id, name)}
              onLocalToggleStatus={applyToggleStatus}
              onLocalToggleFeatured={applyToggleFeatured}
            />
          ))}
        </DragDropProvider>
      </div>

      {reorder.hasChanges && (
        <SaveOrderBar isSaving={reorder.isSaving} onSave={reorder.handleSave} onCancel={reorder.handleCancel} />
      )}

      <DeleteCategoryDialog
        target={deletion.deleteTarget}
        deleteMode={deletion.deleteMode}
        reassignTo={deletion.reassignTo}
        showCascadeConfirm={deletion.showCascadeConfirm}
        isDeleting={deletion.deletingId !== null}
        candidates={reorder.items}
        onSelectMode={deletion.setDeleteMode}
        onSelectReassignTarget={deletion.setReassignTo}
        onConfirm={deletion.confirmDelete}
        onConfirmCascade={deletion.executeCascade}
        onCancel={deletion.cancelDelete}
        onCancelCascade={deletion.cancelDelete}
      />
    </div>
  );
}
