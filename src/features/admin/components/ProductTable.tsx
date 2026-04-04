'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { Database } from '@/lib/supabase/types';
import { deleteProduct, toggleProductStatus } from '@/features/admin/actions/products';
import type { AdminProductFilter } from '@/features/admin/utils/adminFilters';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import EmptyState from '@/components/ui/EmptyState';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface ProductTableProps {
  products: ProductRow[];
  categories: CategoryRow[];
  activeFilter?: AdminProductFilter | null;
  viewedProductIds?: string[];
  emptyMessage?: string;
  clearFilterHref?: string;
}

function matchesActiveFilter(
  product: ProductRow,
  filter: AdminProductFilter | null | undefined,
  viewedProductIds: Set<string>,
): boolean {
  switch (filter) {
    case 'missing-gallery':
      return product.is_active && product.images.length === 0;
    case 'featured-without-views':
      return product.is_featured && !viewedProductIds.has(product.id);
    case 'active-without-views':
      return product.is_active && !viewedProductIds.has(product.id);
    default:
      return true;
  }
}

export default function ProductTable({
  products,
  categories,
  activeFilter = null,
  viewedProductIds = [],
  emptyMessage,
  clearFilterHref,
}: ProductTableProps) {
  const [items, setItems] = useState(products);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const viewedProductIdSet = new Set(viewedProductIds);

  useEffect(() => {
    setItems(products);
  }, [products]);

  async function handleToggleStatus(id: string, isActive: boolean) {
    const previousItems = items;
    const nextItems = items
      .map((product) => (product.id === id ? { ...product, is_active: isActive } : product))
      .filter((product) => matchesActiveFilter(product, activeFilter, viewedProductIdSet));

    setItems(nextItems);

    const result = await toggleProductStatus(id, isActive);
    if (!result.success) {
      setItems(previousItems);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const result = await deleteProduct(deleteTarget.id);
    if (!result.success) {
      toast.error(`Error al eliminar: ${result.error ?? 'Error desconocido'}`);
    } else {
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeletingId(null);
    setDeleteTarget(null);
  }

  if (items.length === 0) {
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

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Imagen
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Nombre
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Categoría
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Precio
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Estado
            </th>
            <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((product, i) => (
            <tr
              key={product.id}
              className="transition-colors"
              style={{
                background: i % 2 === 0 ? 'var(--color-white)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background =
                  i % 2 === 0 ? 'var(--color-white)' : 'transparent';
              }}
            >
              <td className="px-4 py-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface)' }}>
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                  {product.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {product.slug}
                </p>
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
                {categoryMap.get(product.category_id) ?? '—'}
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
                S/ {Number(product.price).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <ToggleSwitch
                  checked={product.is_active}
                  label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
                  onChange={(checked) => void handleToggleStatus(product.id, checked)}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" href={`/admin/productos/${product.id}`}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Eliminando…' : 'Eliminar'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar producto"
        description={
          deleteTarget
            ? `¿Eliminar el producto "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        loading={deletingId !== null}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
