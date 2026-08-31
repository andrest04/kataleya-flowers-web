'use client';

import type { Ref } from 'react';

import Button from '@/components/ui/Button';
import { TableCell, TableRow } from '@/components/ui/primitives/table';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import type { SortableItemRenderProps } from '@/components/ui/SortableList/SortableItem';
import type { CategoryRow } from '@/lib/db/rows';

import CategoryRowImage from './CategoryRowImage';
import CategoryToggleFeatured from './CategoryToggleFeatured';
import CategoryToggleStatus from './CategoryToggleStatus';

interface CategoryRowProps {
  category: CategoryRow;
  index: number;
  deletingId: string | null;
  onDelete: (id: string, name: string) => void;
  onLocalToggleStatus: (id: string, isActive: boolean) => void;
  onLocalToggleFeatured: (id: string, isFeatured: boolean) => void;
  productCount: number;
  sortableProps?: SortableItemRenderProps;
}

export default function CategoryRow({
  category,
  index,
  deletingId,
  onDelete,
  onLocalToggleStatus,
  onLocalToggleFeatured,
  productCount,
  sortableProps,
}: CategoryRowProps) {
  return (
    <TableRow
      ref={sortableProps?.setNodeRef as Ref<HTMLTableRowElement> | undefined}
      style={{
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        ...sortableProps?.style,
      }}
    >
      <TableCell style={{ color: 'var(--color-muted)' }}>
        {sortableProps ? (
          <div className="flex items-center gap-1">
            <DragHandle handleProps={sortableProps.dragHandleProps} label={category.name} />
            <span className="font-mono text-xs">{index + 1}</span>
          </div>
        ) : (
          <span className="block text-center font-mono text-xs">{index + 1}</span>
        )}
      </TableCell>

      <TableCell>
        <CategoryRowImage category={category} />
      </TableCell>

      <TableCell className="whitespace-normal">
        <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>{category.name}</p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{category.slug}</p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {productCount} producto{productCount !== 1 ? 's' : ''}
        </p>
      </TableCell>

      <TableCell className="hidden md:table-cell" style={{ color: 'var(--color-dark)' }}>
        {category.occasion ?? '—'}
      </TableCell>

      <TableCell className="text-center">
        <CategoryToggleStatus id={category.id} name={category.name} isActive={category.is_active} onLocalChange={onLocalToggleStatus} />
      </TableCell>

      <TableCell className="text-center">
        <CategoryToggleFeatured id={category.id} name={category.name} isFeatured={category.is_featured} onLocalChange={onLocalToggleFeatured} />
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="primary" size="sm" href={`/admin/categorias/${category.id}/productos`}>Gestionar productos</Button>
          <Button variant="ghost" size="sm" href={`/admin/categorias/${category.id}`}>Editar</Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(category.id, category.name);
            }}
            disabled={deletingId === category.id}
          >
            {deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
