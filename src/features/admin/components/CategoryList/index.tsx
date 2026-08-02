'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Table, TableBody } from '@/components/ui/primitives/table';
import type { CategoryRow } from '@/lib/db/rows';

import CategoryListHeader from './CategoryListHeader';
import CategoryRowItem from './CategoryRow';
import CategoryRowImage from './CategoryRowImage';
import CategoryToggleFeatured from './CategoryToggleFeatured';
import CategoryToggleStatus from './CategoryToggleStatus';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useCategoryDelete } from './useCategoryDelete';

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
  const [items, setItems] = useState<CategoryRow[]>(initialCategories);
  const deletion = useCategoryDelete({
    onDeleted: (id) => setItems((current) => current.filter((category) => category.id !== id)),
  });

  function applyToggleStatus(id: string, isActive: boolean) {
    setItems((current) => current.map((category) => (
      category.id === id ? { ...category, is_active: isActive } : category
    )));
  }

  function applyToggleFeatured(id: string, isFeatured: boolean) {
    setItems((current) => current.map((category) => (
      category.id === id ? { ...category, is_featured: isFeatured } : category
    )));
  }

  if (items.length === 0) {
    return (
      <EmptyState
        message={emptyMessage ?? 'No hay categorías aún. ¡Crea la primera!'}
        action={clearFilterHref ? <Button href={clearFilterHref} variant="ghost" size="sm">Ver todas las categorías</Button> : undefined}
      />
    );
  }

  return (
    <div>
      <div
        className="hidden overflow-hidden rounded-xl md:block"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <Table aria-label="Categorías">
          <CategoryListHeader />
          <TableBody>
            {items.map((category, index) => (
              <CategoryRowItem
                key={category.id}
                category={category}
                index={index}
                deletingId={deletion.deletingId}
                onDelete={(id, name) => void deletion.requestDelete(id, name)}
                onLocalToggleStatus={applyToggleStatus}
                onLocalToggleFeatured={applyToggleFeatured}
                productCount={productCounts[category.id] ?? 0}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((category) => (
          <article
            key={category.id}
            className="rounded-xl p-4"
            style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex gap-3">
              <CategoryRowImage category={category} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>{category.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{category.slug}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {(productCounts[category.id] ?? 0)} producto{(productCounts[category.id] ?? 0) !== 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-dark)' }}>
                  {category.occasion ?? '—'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <CategoryToggleStatus
                id={category.id}
                name={category.name}
                isActive={category.is_active}
                onLocalChange={applyToggleStatus}
              />
              <CategoryToggleFeatured
                id={category.id}
                name={category.name}
                isFeatured={category.is_featured}
                onLocalChange={applyToggleFeatured}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" href={`/admin/categorias/${category.id}/productos`}>Gestionar productos</Button>
              <Button variant="ghost" size="sm" href={`/admin/categorias/${category.id}`}>Editar</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void deletion.requestDelete(category.id, category.name)}
                disabled={deletion.deletingId === category.id}
              >
                {deletion.deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </div>
          </article>
        ))}
      </div>

      <DeleteCategoryDialog
        target={deletion.deleteTarget}
        deleteMode={deletion.deleteMode}
        reassignTo={deletion.reassignTo}
        showCascadeConfirm={deletion.showCascadeConfirm}
        isDeleting={deletion.deletingId !== null}
        candidates={items}
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
