'use client';

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
  productCounts: Record<string, number>;
}

export default function CategoryList({
  categories: initialCategories,
  emptyMessage,
  clearFilterHref,
  productCounts,
}: CategoryListProps) {
  const reorder = useCategoryReorder(initialCategories);
  const deletion = useCategoryDelete({
    onDeleted: (id) => reorder.setItems(reorder.items.filter((category) => category.id !== id)),
  });
  const dndA11y = useDndAccessibility(reorder.items, (category) => category.name);

  function applyToggleStatus(id: string, isActive: boolean) {
    reorder.setItems(reorder.items.map((category) => (
      category.id === id ? { ...category, is_active: isActive } : category
    )));
  }

  function applyToggleFeatured(id: string, isFeatured: boolean) {
    reorder.setItems(reorder.items.map((category) => (
      category.id === id ? { ...category, is_featured: isFeatured } : category
    )));
  }

  if (reorder.items.length === 0) {
    return (
      <EmptyState
        message={emptyMessage ?? 'No hay categorías aún. ¡Crea la primera!'}
        action={clearFilterHref ? <Button href={clearFilterHref} variant="ghost" size="sm">Ver todas las categorías</Button> : undefined}
      />
    );
  }

  return (
    <div>
      <DndLiveRegion message={dndA11y.message} />

      <div
        role="region"
        aria-label="Orden de categorías"
        className="overflow-hidden rounded-xl"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <p id="category-sort-instructions" className="sr-only">
          Usa la barra espaciadora para tomar una categoría, las flechas para moverla y la barra espaciadora para soltarla.
        </p>
        <CategoryListHeader hasChanges={reorder.hasChanges} />

        <DragDropProvider
          onDragStart={dndA11y.onDragStart}
          onDragOver={dndA11y.onDragOver}
          onDragEnd={(event, manager) => {
            dndA11y.onDragEnd(event, manager);
            reorder.handleDragEnd(event, manager);
          }}
        >
          <ul aria-label="Categorías reordenables">
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
                productCount={productCounts[category.id] ?? 0}
              />
            ))}
          </ul>
        </DragDropProvider>
      </div>

      {reorder.hasChanges ? (
        <SaveOrderBar
          isSaving={reorder.isSaving}
          onSave={reorder.handleSave}
          onCancel={reorder.handleCancel}
        />
      ) : null}

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
