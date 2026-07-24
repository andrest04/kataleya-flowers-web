'use client';

import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';

import ToggleSwitch from '@/components/ui/ToggleSwitch';

import ProductTableActions from './ProductTableActions';
import ProductTableImage from './ProductTableImage';
import type { ProductTableRowBaseProps } from './ProductTableRow';

export default function ProductTableSortableRow({
  product,
  index,
  hasChanges,
  deletingId,
  onToggleStatus,
  onDelete,
}: ProductTableRowBaseProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: product.id,
    index,
    transition: { idle: true },
  });

  return (
    <li
      ref={ref}
      aria-roledescription="producto reordenable"
      className="flex items-center gap-4 px-4 py-3 motion-safe:transition-colors"
      style={{
        background: isDragging ? 'var(--color-surface)' : 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <button
        ref={handleRef}
        type="button"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        style={{ color: 'var(--color-muted)', cursor: 'grab', touchAction: 'none' }}
        aria-label={`Arrastrar "${product.name}" para reordenar`}
        aria-describedby="product-sort-instructions"
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>

      <span className="w-5 shrink-0 text-center font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
        {index + 1}
      </span>

      <ProductTableImage product={product} sizeClass="w-10 h-10" sizes="40px" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          {product.name}
        </p>
        <p className="truncate text-xs" style={{ color: 'var(--color-muted)' }}>
          {product.slug}
        </p>
      </div>

      <span className="w-20 shrink-0 text-sm" style={{ color: 'var(--color-dark)' }}>
        S/ {Number(product.price).toFixed(2)}
      </span>

      <div className="flex w-12 shrink-0 justify-center">
        <ToggleSwitch
          checked={product.is_active}
          label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
          onChange={(checked) => onToggleStatus(product.id, checked)}
        />
      </div>

      {!hasChanges && (
        <div className="w-36 shrink-0">
          <ProductTableActions
            productId={product.id}
            productName={product.name}
            isDeleting={deletingId === product.id}
            onDelete={onDelete}
          />
        </div>
      )}
    </li>
  );
}
