'use client';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { Table, TableBody } from '@/components/ui/primitives/table';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import type { AdminProductListRow } from '@/features/admin/queries/products';

import ProductTableHeader from './ProductTableHeader';
import ProductTableImage from './ProductTableImage';
import ProductTableStaticRow from './ProductTableStaticRow';
import { useProductTable } from './useProductTable';

interface ProductTableProps {
  products: AdminProductListRow[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const table = useProductTable(products);

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

  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-xl md:block" style={{ border: '1px solid var(--color-border)' }}>
        <Table style={{ fontFamily: 'var(--font-body)' }}>
          <ProductTableHeader />
          <TableBody>
            {table.items.map((product, index) => (
              <ProductTableStaticRow
                key={product.id}
                product={product}
                zebra={index % 2 === 0}
                deletingId={table.deletingId}
                onToggleStatus={(id, checked) => void table.handleToggleStatus(id, checked)}
                onDelete={(id, name) => table.requestDelete({ id, name })}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {table.items.map((product) => (
          <article
            key={product.id}
            className="flex flex-col gap-2 rounded-xl p-3"
            style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
          >
            <ProductTableImage product={product} sizeClass="w-full aspect-square" sizes="(max-width: 768px) 50vw, 200px" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                S/ {Number(product.price).toFixed(2)}
              </p>
            </div>
            <ToggleSwitch
              checked={product.is_active}
              label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
              onChange={(checked) => void table.handleToggleStatus(product.id, checked)}
            />
            <div className="flex flex-col gap-1.5">
              <Button variant="ghost" size="sm" fullWidth href={`/admin/productos/${product.id}`}>
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                fullWidth
                onClick={() => table.requestDelete({ id: product.id, name: product.name })}
                disabled={table.deletingId === product.id}
              >
                {table.deletingId === product.id ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {dialog}
    </div>
  );
}
