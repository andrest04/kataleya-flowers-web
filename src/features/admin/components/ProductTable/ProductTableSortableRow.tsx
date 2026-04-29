'use client';

/**
 * ProductTableSortableRow — fila flex con drag handle (`useSortable`).
 *
 * Notas drag-and-drop:
 * - `transition: { idle: true }` activa la animación cuando el índice cambia
 *   sin drag activo (los vecinos se desplazan suavemente).
 * - El handle es un `<button>` aislado: solo él inicia drag, los demás
 *   controles del row reciben clicks normales.
 */

import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import ProductTableActions from './ProductTableActions';
import ProductTableImage from './ProductTableImage';
import type { ProductTableRowBaseProps } from './ProductTableRow';

export default function ProductTableSortableRow({
  product,
  index,
  hasChanges,
  deletingId,
  categoryName,
  onToggleStatus,
  onDelete,
}: ProductTableRowBaseProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: product.id,
    index,
    transition: { idle: true },
  });

  return (
    <div
      ref={ref}
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
        className="flex items-center justify-center w-6 h-6 rounded flex-shrink-0 transition-colors hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        style={{ color: 'var(--color-muted)', cursor: 'grab', touchAction: 'none' }}
        aria-label={`Arrastrar "${product.name}" para reordenar`}
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>

      <span className="text-xs font-mono w-5 text-center flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
        {index + 1}
      </span>

      <ProductTableImage product={product} sizeClass="w-10 h-10" sizes="40px" />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--color-dark)' }}>
          {product.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
          {product.slug}
        </p>
      </div>

      <span className="text-sm hidden md:block w-28 flex-shrink-0 truncate" style={{ color: 'var(--color-dark)' }}>
        {categoryName}
      </span>

      <span className="text-sm w-20 flex-shrink-0" style={{ color: 'var(--color-dark)' }}>
        S/ {Number(product.price).toFixed(2)}
      </span>

      <div className="w-12 flex-shrink-0 flex justify-center">
        <ToggleSwitch
          checked={product.is_active}
          label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
          onChange={(checked) => onToggleStatus(product.id, checked)}
        />
      </div>

      {!hasChanges && (
        <div className="flex-shrink-0 w-36">
          <ProductTableActions
            productId={product.id}
            productName={product.name}
            isDeleting={deletingId === product.id}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
