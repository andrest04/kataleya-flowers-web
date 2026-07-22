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
}

export default function CategoryRow({
  category,
  index,
  deletingId,
  hasChanges,
  onDelete,
  onLocalToggleStatus,
  onLocalToggleFeatured,
}: CategoryRowProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: category.id,
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
        aria-label={`Arrastrar "${category.name}" para reordenar`}
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>

      <span className="text-xs font-mono w-5 text-center flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
        {index + 1}
      </span>

      <CategoryRowImage category={category} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--color-dark)' }}>{category.name}</p>
        <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{category.slug}</p>
      </div>

      <span className="text-sm hidden md:block w-28 flex-shrink-0 truncate" style={{ color: 'var(--color-dark)' }}>
        {category.occasion ?? '—'}
      </span>

      <div className="w-12 flex-shrink-0 flex justify-center">
        <CategoryToggleStatus id={category.id} name={category.name} isActive={category.is_active} onLocalChange={onLocalToggleStatus} />
      </div>

      <div className="w-20 flex-shrink-0 flex justify-center">
        <CategoryToggleFeatured id={category.id} name={category.name} isFeatured={category.is_featured} onLocalChange={onLocalToggleFeatured} />
      </div>

      {!hasChanges && (
        <div className="flex items-center gap-2 flex-shrink-0 w-36 justify-end">
          <Button variant="ghost" size="sm" href={`/admin/categorias/${category.id}`}>Editar</Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(category.id, category.name); }}
            disabled={deletingId === category.id}
          >
            {deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      )}
    </div>
  );
}
