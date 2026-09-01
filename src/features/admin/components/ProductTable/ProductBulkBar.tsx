'use client';

import Button from '@/components/ui/Button';

interface ProductBulkBarProps {
  disabled: boolean;
  onDelete: () => void;
  onSetStatus: (isActive: boolean) => void;
  selectedCount: number;
}

export default function ProductBulkBar({
  disabled,
  onDelete,
  onSetStatus,
  selectedCount,
}: ProductBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Acciones para los productos seleccionados"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p aria-live="polite" className="text-sm font-medium text-(--color-dark)">
        {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onSetStatus(true)}>
          Publicar
        </Button>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onSetStatus(false)}>
          Ocultar
        </Button>
        <Button variant="destructive" size="sm" disabled={disabled} onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}
