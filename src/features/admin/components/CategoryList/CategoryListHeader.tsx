'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/primitives/table';

export default function CategoryListHeader() {
  return (
    <TableHeader>
      <TableRow
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <TableHead style={{ color: 'var(--color-dark)' }}>#</TableHead>
        <TableHead style={{ color: 'var(--color-dark)' }}>Imagen</TableHead>
        <TableHead style={{ color: 'var(--color-dark)' }}>Nombre</TableHead>
        <TableHead className="hidden md:table-cell" style={{ color: 'var(--color-dark)' }}>Ocasión</TableHead>
        <TableHead className="text-center" style={{ color: 'var(--color-dark)' }}>Estado</TableHead>
        <TableHead className="text-center" style={{ color: 'var(--color-dark)' }}>Destacado</TableHead>
        <TableHead className="text-right" style={{ color: 'var(--color-dark)' }}>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
}
