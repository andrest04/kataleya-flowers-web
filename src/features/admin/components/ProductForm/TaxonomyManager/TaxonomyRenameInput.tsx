'use client';

import { X } from 'lucide-react';
import type { RefObject } from 'react';

import { RENAME_INPUT_WIDTH } from './styles';

interface Props {
  readonly value: string;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly originalName: string;
  readonly onChange: (v: string) => void;
  readonly onCommit: (oldName: string) => void;
  readonly onCancel: () => void;
}

export default function TaxonomyRenameInput({
  value,
  inputRef,
  originalName,
  onChange,
  onCommit,
  onCancel,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        aria-label={`Renombrar ${originalName}`}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onCommit(originalName);
          }
          if (e.key === 'Escape') onCancel();
        }}
        className="rounded-full px-3 py-1 text-sm border outline-none focus:ring-1"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-dark)',
          background: 'var(--color-white)',
          width: RENAME_INPUT_WIDTH,
        }}
      />
      <button
        type="button"
        onClick={onCancel}
        className="text-xs"
        style={{ color: 'var(--color-muted)' }}
        aria-label="Cancelar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
