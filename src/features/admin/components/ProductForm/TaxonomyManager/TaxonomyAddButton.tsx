'use client';

import { Plus } from 'lucide-react';

interface Props {
  readonly label: string;
  readonly onClick: () => void;
}

/** Botón cerrado con borde dasheado: "+ Nuevo X". Abre el form de add. */
export default function TaxonomyAddButton({ label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 text-sm border border-dashed transition-colors hover:opacity-70 inline-flex items-center gap-1"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-muted)',
      }}
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
