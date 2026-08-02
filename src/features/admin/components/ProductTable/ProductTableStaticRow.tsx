'use client';

import { TableCell, TableRow } from '@/components/ui/primitives/table';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import type { AdminProductListRow } from '@/features/admin/queries/products';

import ProductTableActions from './ProductTableActions';
import ProductTableImage from './ProductTableImage';

interface ProductTableStaticRowProps {
  product: AdminProductListRow;
  zebra: boolean;
  deletingId: string | null;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ProductTableStaticRow({
  product,
  zebra,
  deletingId,
  onToggleStatus,
  onDelete,
}: ProductTableStaticRowProps) {
  return (
    <TableRow
      className="transition-colors hover:bg-(--color-surface)"
      style={{
        background: zebra ? 'var(--color-white)' : 'transparent',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
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
