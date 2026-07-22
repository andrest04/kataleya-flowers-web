'use client';

import type { AdminProductRow } from '@/features/admin/queries/products';

import ProductTableSortableRow from './ProductTableSortableRow';
import ProductTableStaticRow from './ProductTableStaticRow';

export interface ProductTableRowBaseProps {
  product: AdminProductRow;
  index: number;
  hasChanges: boolean;
  deletingId: string | null;
  categoryName: string;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

interface ProductTableRowProps extends ProductTableRowBaseProps {
  reorderable: boolean;
  zebra: boolean;
}

export default function ProductTableRow({ reorderable, zebra, ...rest }: ProductTableRowProps) {
  return reorderable ? <ProductTableSortableRow {...rest} /> : <ProductTableStaticRow {...rest} zebra={zebra} />;
}
