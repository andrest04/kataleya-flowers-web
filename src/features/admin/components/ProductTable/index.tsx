'use client';

import { DragDropProvider } from '@dnd-kit/react';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { useDndAccessibility } from '@/features/admin/hooks/useDndAccessibility';
import type { AdminProductRow } from '@/features/admin/queries/products';
import type { AdminProductFilter } from '@/features/admin/utils/adminFilters';
import type { CategoryRow } from '@/lib/db/rows';

import DndLiveRegion from '../DndLiveRegion';
import SaveOrderBar from '../SaveOrderBar';
import ProductTableHeader from './ProductTableHeader';
import ProductTableRow from './ProductTableRow';
import { useProductTable } from './useProductTable';

interface ProductTableProps {
  products: AdminProductRow[];
  categories: CategoryRow[];
  reorderable?: boolean;
  activeFilter?: AdminProductFilter | null;
  emptyMessage?: string;
  clearFilterHref?: string;
}

export default function ProductTable({
  products,
  categories,
  reorderable = false,
  activeFilter = null,
  emptyMessage,
  clearFilterHref,
}: ProductTableProps) {
  const table = useProductTable({ initial: products, activeFilter });
  const dndA11y = useDndAccessibility(table.items, (p) => p.name);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  if (table.items.length === 0) {
    return (
      <EmptyState
        message={emptyMessage ?? 'No hay productos aún. ¡Creá el primero!'}
        action={
          clearFilterHref ? (
            <Button href={clearFilterHref} variant="ghost" size="sm">
              Ver todos los productos
            </Button>
          ) : undefined
        }
      />
    );
  }

  const dialog = (
    <ConfirmDialog
      open={table.deleteTarget !== null}
      title="Eliminar producto"
      description={
        table.deleteTarget
          ? `¿Eliminar el producto "${table.deleteTarget.name}"? Esta acción no se puede deshacer.`
          : ''
      }
      confirmLabel="Eliminar"
      loading={table.deletingId !== null}
      onConfirm={() => void table.confirmDelete()}
      onCancel={table.cancelDelete}
    />
  );

  const rowProps = (product: AdminProductRow, index: number, opts: { reorderable: boolean; zebra: boolean; hasChanges: boolean }) => ({
    product,
    index,
    reorderable: opts.reorderable,
    zebra: opts.zebra,
    hasChanges: opts.hasChanges,
    deletingId: table.deletingId,
    categoryName: categoryMap.get(product.category_id) ?? '—',
    onToggleStatus: (id: string, checked: boolean) => void table.handleToggleStatus(id, checked),
    onDelete: (id: string, name: string) => table.requestDelete({ id, name }),
  });

  if (reorderable) {
    return (
      <div>
        <DndLiveRegion message={dndA11y.message} />
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <ProductTableHeader reorderable hasChanges={table.hasChanges} />
          <DragDropProvider
            onDragStart={dndA11y.onDragStart}
            onDragOver={dndA11y.onDragOver}
            onDragEnd={(event, manager) => {
              dndA11y.onDragEnd(event, manager);
              table.handleDragEnd(event, manager);
            }}
          >
            {table.items.map((product, index) => (
              <ProductTableRow key={product.id} {...rowProps(product, index, { reorderable: true, zebra: false, hasChanges: table.hasChanges })} />
            ))}
          </DragDropProvider>
        </div>
        {table.hasChanges && (
          <SaveOrderBar isSaving={table.isSaving} onSave={table.handleSave} onCancel={table.handleCancel} />
        )}
        {dialog}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
        <ProductTableHeader reorderable={false} hasChanges={table.hasChanges} />
        <tbody>
          {table.items.map((product, index) => (
            <ProductTableRow key={product.id} {...rowProps(product, index, { reorderable: false, zebra: index % 2 === 0, hasChanges: false })} />
          ))}
        </tbody>
      </table>
      {dialog}
    </div>
  );
}
