'use client';

/**
 * SaveOrderBar — banda inferior con CTA "Guardar / Cancelar" tras un reorder.
 * Reusable entre `ProductTable` y `CategoryList`.
 */

import Button from '@/components/ui/Button';

interface SaveOrderBarProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  message?: string;
}

export default function SaveOrderBar({
  isSaving,
  onSave,
  onCancel,
  message = 'Orden modificado — ¿guardar cambios?',
}: SaveOrderBarProps) {
  return (
    <div
      className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl"
      style={{
        background: 'color-mix(in srgb, var(--color-secondary) 10%, var(--color-cream))',
        border: '1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent)',
      }}
    >
      <p className="text-sm" style={{ color: 'var(--color-dark)' }}>
        {message}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={onSave} loading={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar orden'}
        </Button>
      </div>
    </div>
  );
}
