'use client';

import type { Ref } from 'react';

import { TableCell, TableRow } from '@/components/ui/primitives/table';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import type { SortableItemRenderProps } from '@/components/ui/SortableList/SortableItem';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import type { AdminProductListRow } from '@/features/admin/queries/products';

import ProductSelectCheckbox from './ProductSelectCheckbox';
import ProductTableActions from './ProductTableActions';
import ProductTableImage from './ProductTableImage';

interface ProductTableStaticRowProps {
  product: AdminProductListRow;
  zebra: boolean;
  deletingId: string | null;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
  sortableProps?: SortableItemRenderProps;
}

export default function ProductTableStaticRow({
  product,
  zebra,
  deletingId,
  isSelected = false,
  onSelect,
  onToggleStatus,
  onDelete,
  sortableProps,
}: ProductTableStaticRowProps) {
  return (
    <TableRow
      ref={sortableProps?.setNodeRef as Ref<HTMLTableRowElement> | undefined}
      className="transition-colors hover:bg-(--color-surface)"
      style={{
        background: zebra ? 'var(--color-white)' : 'transparent',
        borderBottom: '1px solid var(--color-border)',
        ...sortableProps?.style,
      }}
    >
      {sortableProps ? (
        <TableCell>
          <DragHandle handleProps={sortableProps.dragHandleProps} label={product.name} />
        </TableCell>
      ) : null}
      {onSelect ? (
        <TableCell>
          <ProductSelectCheckbox
            checked={isSelected}
            label={`Seleccionar ${product.name}`}
            onChange={(selected) => onSelect(product.id, selected)}
          />
        </TableCell>
      ) : null}
      <TableCell><ProductTableImage product={product} sizeClass="h-12 w-12" sizes="48px" /></TableCell>
      <TableCell>
        <p className="font-medium" style={{ color: 'var(--color-dark)' }}>{product.name}</p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>{product.slug}</p>
      </TableCell>
      <TableCell style={{ color: 'var(--color-dark)' }}>S/ {Number(product.price).toFixed(2)}</TableCell>
      <TableCell><ToggleSwitch checked={product.is_active} label={`${product.is_active ? 'Desactivar' : 'Activar'} ${product.name}`} onChange={(checked) => onToggleStatus(product.id, checked)} /></TableCell>
      <TableCell><ProductTableActions productId={product.id} productName={product.name} isDeleting={deletingId === product.id} onDelete={onDelete} /></TableCell>
    </TableRow>
  );
}
