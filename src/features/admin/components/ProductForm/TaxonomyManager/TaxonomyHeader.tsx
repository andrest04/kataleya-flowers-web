'use client';

import { Label } from '@/components/ui/primitives/label';

interface Props {
  readonly label: string;
  readonly manageMode: boolean;
  readonly onToggleManageMode: () => void;
}

/**
 * Header del manager: label del fieldset + botón "Gestionar/Listo".
 *
 * Reemplaza el hack previo `<FormField label={label}><></></FormField>`
 * usando el primitive `Label` directamente.
 */
export default function TaxonomyHeader({
  label,
  manageMode,
  onToggleManageMode,
}: Props) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={onToggleManageMode}
        className="text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-muted)' }}
      >
        {manageMode ? 'Listo' : 'Gestionar'}
      </button>
    </div>
  );
}
