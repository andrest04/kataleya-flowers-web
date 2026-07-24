'use client';

import { DragDropProvider } from '@dnd-kit/react';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useDndAccessibility } from '@/features/admin/hooks/useDndAccessibility';
import type { AdminProductListRow } from '@/features/admin/queries/products';

import DndLiveRegion from '../DndLiveRegion';
import SaveOrderBar from '../SaveOrderBar';
import ProductTableActions from './ProductTableActions';
import ProductTableHeader from './ProductTableHeader';
import ProductTableImage from './ProductTableImage';
import ProductTableRow from './ProductTableRow';
import { useProductTable } from './useProductTable';

interface ProductTableProps {
  products: AdminProductListRow[];
  reorderable?: boolean;
  reorderCategoryId?: string;
}

export default function ProductTable({
  products,
  reorderable = false,
  reorderCategoryId,
}: ProductTableProps) {
  const table = useProductTable({ initial: products, reorderCategoryId });
  const dndA11y = useDndAccessibility(table.items, (product) => product.name);

  if (table.items.length === 0) {
    return <EmptyState message="No hay productos en esta categoría todavía." />;
  }

  const dialog = (
    <ConfirmDialog
      open={table.deleteTarget !== null}
      title="Eliminar producto"
      description={table.deleteTarget ? `¿Eliminar el producto "${table.deleteTarget.name}"? Esta acción no se puede deshacer.` : ''}
      confirmLabel="Eliminar"
      loading={table.deletingId !== null}
      onConfirm={() => void table.confirmDelete()}
      onCancel={table.cancelDelete}
    />
  );
  const rowProps = (product: AdminProductListRow, index: number, zebra: boolean) => ({
    product,
    index,
    reorderable,
    zebra,
    hasChanges: table.hasChanges,
    deletingId: table.deletingId,
    onToggleStatus: (id: string, checked: boolean) => void table.handleToggleStatus(id, checked),
    onDelete: (id: string, name: string) => table.requestDelete({ id, name }),
  });

  return (
    <div className="space-y-3">
      {reorderable ? (
        <div>
          <DndLiveRegion message={dndA11y.message} />
          <div
            role="region"
            aria-label="Orden de productos"
            className="overflow-hidden rounded-xl"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <p id="product-sort-instructions" className="sr-only">
              Usa la barra espaciadora para tomar un producto, las flechas para moverlo y la barra espaciadora para soltarlo.
            </p>
            <ProductTableHeader reorderable hasChanges={table.hasChanges} />
            <DragDropProvider
              onDragStart={dndA11y.onDragStart}
              onDragOver={dndA11y.onDragOver}
              onDragEnd={(event, manager) => {
                dndA11y.onDragEnd(event, manager);
                table.handleDragEnd(event, manager);
              }}
            >
              <ul aria-label="Productos reordenables">
                {table.items.map((product, index) => (
                  <ProductTableRow key={product.id} {...rowProps(product, index, false)} />
                ))}
              </ul>
            </DragDropProvider>
          </div>
          {table.hasChanges ? (
            <SaveOrderBar
              isSaving={table.isSaving}
              onSave={table.handleSave}
              onCancel={table.handleCancel}
            />
          ) : null}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl md:block" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <ProductTableHeader reorderable={false} hasChanges={false} />
              <tbody>
                {table.items.map((product, index) => (
                  <ProductTableRow key={product.id} {...rowProps(product, index, index % 2 === 0)} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {table.items.map((product) => (
              <article
                key={product.id}
                className="rounded-xl p-4"
                style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex gap-3">
                  <ProductTableImage product={product} sizeClass="h-16 w-16" sizes="64px" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      S/ {Number(product.price).toFixed(2)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <ToggleSwitch
                        checked={product.is_active}
                        label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
                        onChange={(checked) => void table.handleToggleStatus(product.id, checked)}
                      />
                      <ProductTableActions
                        productId={product.id}
                        productName={product.name}
                        isDeleting={table.deletingId === product.id}
                        onDelete={(id, name) => table.requestDelete({ id, name })}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {dialog}
    </div>
  );
}
