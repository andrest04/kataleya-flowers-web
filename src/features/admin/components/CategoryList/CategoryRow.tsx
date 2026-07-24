'use client';

import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';

import Button from '@/components/ui/Button';
import type { CategoryRow } from '@/lib/db/rows';

import CategoryRowImage from './CategoryRowImage';
import CategoryToggleFeatured from './CategoryToggleFeatured';
import CategoryToggleStatus from './CategoryToggleStatus';

interface CategoryRowProps {
  category: CategoryRow;
  index: number;
  deletingId: string | null;
  hasChanges: boolean;
  onDelete: (id: string, name: string) => void;
  onLocalToggleStatus: (id: string, isActive: boolean) => void;
  onLocalToggleFeatured: (id: string, isFeatured: boolean) => void;
  productCount: number;
}

export default function CategoryRow({
  category,
  index,
  deletingId,
  hasChanges,
  onDelete,
  onLocalToggleStatus,
  onLocalToggleFeatured,
  productCount,
}: CategoryRowProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: category.id,
    index,
    transition: { idle: true },
  });

  return (
    <li
      ref={ref}
      aria-roledescription="categoría reordenable"
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
        aria-label={`Arrastrar "${category.name}" para reordenar`}
        aria-describedby="category-sort-instructions"
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>

      <span className="w-5 shrink-0 text-center font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
        {index + 1}
      </span>

      <CategoryRowImage category={category} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--color-dark)' }}>{category.name}</p>
        <p className="truncate text-xs" style={{ color: 'var(--color-muted)' }}>{category.slug}</p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {productCount} producto{productCount !== 1 ? 's' : ''}
        </p>
      </div>

      <span className="hidden w-28 shrink-0 truncate text-sm md:block" style={{ color: 'var(--color-dark)' }}>
        {category.occasion ?? '—'}
      </span>

      <div className="flex w-12 shrink-0 justify-center">
        <CategoryToggleStatus id={category.id} name={category.name} isActive={category.is_active} onLocalChange={onLocalToggleStatus} />
      </div>

      <div className="flex w-20 shrink-0 justify-center">
        <CategoryToggleFeatured id={category.id} name={category.name} isFeatured={category.is_featured} onLocalChange={onLocalToggleFeatured} />
      </div>

      {!hasChanges ? (
        <div className="flex shrink-0 items-center justify-end gap-2">
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
      ) : null}
    </li>
  );
}
