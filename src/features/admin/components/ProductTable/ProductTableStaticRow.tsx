'use client';

/**
 * ProductTableStaticRow — fila HTML `<tr>` para la tabla nativa, sin DnD.
 * Hover declarativo via Tailwind (`hover:bg-(--color-surface)`) en lugar de
 * la manipulación imperativa con `onMouseEnter`/`onMouseLeave` de la versión 1.x.
 */

import ToggleSwitch from '@/components/ui/ToggleSwitch';
import ProductTableActions from './ProductTableActions';
import ProductTableImage from './ProductTableImage';
import type { ProductTableRowBaseProps } from './ProductTableRow';

interface ProductTableStaticRowProps extends ProductTableRowBaseProps {
  zebra: boolean;
}

export default function ProductTableStaticRow({
  product,
  zebra,
  deletingId,
  categoryName,
  onToggleStatus,
  onDelete,
}: ProductTableStaticRowProps) {
  return (
    <tr
      className="transition-colors hover:bg-(--color-surface)"
      style={{
        background: zebra ? 'var(--color-white)' : 'transparent',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <td className="px-4 py-3">
        <ProductTableImage product={product} sizeClass="w-12 h-12" sizes="48px" />
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
        {categoryName}
      </td>
      <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
        S/ {Number(product.price).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <ToggleSwitch
          checked={product.is_active}
          label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`}
          onChange={(checked) => onToggleStatus(product.id, checked)}
        />
      </td>
      <td className="px-4 py-3">
        <ProductTableActions
          productId={product.id}
          productName={product.name}
          isDeleting={deletingId === product.id}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
