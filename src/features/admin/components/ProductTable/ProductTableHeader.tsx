'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/primitives/table';

const HEADER_BASE_STYLE: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-dark)',
};

export default function ProductTableHeader() {
  return (
    <TableHeader>
      <TableRow style={HEADER_BASE_STYLE}>
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
