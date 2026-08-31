'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/primitives/table';

import ProductSelectCheckbox from './ProductSelectCheckbox';

const HEADER_BASE_STYLE: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-dark)',
};

interface ProductTableHeaderProps {
  allSelected?: boolean;
  onToggleAll?: (selected: boolean) => void;
  someSelected?: boolean;
  sortable?: boolean;
}

export default function ProductTableHeader({
  allSelected = false,
  onToggleAll,
  someSelected = false,
  sortable = false,
}: ProductTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow style={HEADER_BASE_STYLE}>
        {sortable ? (
          <TableHead className="w-12" style={{ color: 'var(--color-dark)' }}>
            <span className="sr-only">Orden</span>
          </TableHead>
        ) : null}
        {onToggleAll ? (
          <TableHead className="w-10" style={{ color: 'var(--color-dark)' }}>
            <ProductSelectCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              label="Seleccionar todos los productos de esta página"
              onChange={onToggleAll}
            />
          </TableHead>
        ) : null}
        {['Imagen', 'Nombre', 'Precio', 'Estado', 'Acciones'].map((label) => (
          <TableHead
            key={label}
            className={label === 'Acciones' ? 'text-right' : 'text-left'}
            style={{ color: 'var(--color-dark)' }}
          >
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
