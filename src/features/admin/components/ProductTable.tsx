'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';
import type { Database } from '@/lib/supabase/types';
import { deleteProduct, toggleProductStatus, reorderProducts } from '@/features/admin/actions/products';
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
  reorderable?: boolean;
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

// ── Sortable row (used when reorderable) ─────────────────────────────────────

interface SortableRowProps {
  product: ProductRow;
  index: number;
  categoryName: string;
  hasChanges: boolean;
  deletingId: string | null;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

function SortableRow({
  product,
  index,
  categoryName,
  hasChanges,
  deletingId,
  onToggleStatus,
  onDelete,
}: SortableRowProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: product.id, index });

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
      {/* Drag handle */}
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
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
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
          {product.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
          {product.slug}
        </p>
      </div>

      {/* Category */}
      <span className="text-sm hidden md:block w-28 flex-shrink-0 truncate" style={{ color: 'var(--color-dark)' }}>
        {categoryName}
      </span>

      {/* Price */}
      <span className="text-sm w-20 flex-shrink-0" style={{ color: 'var(--color-dark)' }}>
        S/ {Number(product.price).toFixed(2)}
      </span>

      {/* Status toggle */}
      <div className="w-12 flex-shrink-0 flex justify-center">
        <ToggleSwitch
          checked={product.is_active}
          label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
          onChange={(checked) => onToggleStatus(product.id, checked)}
        />
      </div>

      {/* Actions — hidden while pending changes */}
      {!hasChanges && (
        <div className="flex items-center gap-2 flex-shrink-0 w-36 justify-end">
          <Button variant="ghost" size="sm" href={`/admin/productos/${product.id}`}>
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id, product.name);
            }}
            disabled={deletingId === product.id}
          >
            {deletingId === product.id ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ProductTable({
  products,
  categories,
  reorderable = false,
  activeFilter = null,
  viewedProductIds = [],
  emptyMessage,
  clearFilterHref,
}: ProductTableProps) {
  const [items, setItems] = useState(products);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startTransition] = useTransition();

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const viewedProductIdSet = new Set(viewedProductIds);

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

  function handleDragEnd(event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0]) {
    if (event.canceled) return;
    const newItems = move(items, event);
    setItems(newItems);
    setHasChanges(true);
  }

  function handleSave() {
    const orderedIds = items.map((p) => p.id);
    startTransition(async () => {
      const result = await reorderProducts(orderedIds);
      if (!result.success) {
        toast.error(`Error al reordenar: ${result.error ?? 'Error desconocido'}`);
        setItems(products);
      }
      setHasChanges(false);
    });
  }

  function handleCancel() {
    setItems(products);
    setHasChanges(false);
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

  // ── Reorderable view (DnD rows, like CategoryList) ──────────────────────────

  if (reorderable) {
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
            <span className="hidden md:block w-28 flex-shrink-0">Categoría</span>
            <span className="w-20 flex-shrink-0">Precio</span>
            <span className="w-12 flex-shrink-0 text-center">Estado</span>
            {!hasChanges && <span className="w-36 text-right">Acciones</span>}
          </div>

          {/* Sortable list */}
          <DragDropProvider onDragEnd={handleDragEnd}>
            {items.map((product, index) => (
              <SortableRow
                key={product.id}
                product={product}
                index={index}
                categoryName={categoryMap.get(product.category_id) ?? '—'}
                hasChanges={hasChanges}
                deletingId={deletingId}
                onToggleStatus={(id, checked) => void handleToggleStatus(id, checked)}
                onDelete={(id, name) => setDeleteTarget({ id, name })}
              />
            ))}
          </DragDropProvider>
        </div>

        {/* Save / Cancel bar */}
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

  // ── Standard table view (no DnD) ───────────────────────────────────────────

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
