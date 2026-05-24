'use client';

import { X } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';

import { ADD_INPUT_WIDTH, getActiveColorVar } from './styles';
import type { ActiveColor } from './types';

interface Props {
  readonly value: string;
  readonly placeholder: string;
  readonly ariaLabel: string;
  readonly activeColor: ActiveColor;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly extra: { hex: string };
  readonly renderExtraInput?: (
    extra: { hex: string },
    setExtra: (v: { hex: string }) => void,
  ) => ReactNode;
  readonly setExtra: (v: { hex: string }) => void;
  readonly onChange: (v: string) => void;
  readonly onCancel: () => void;
  readonly onCommit: () => void;
}

/** Form abierto: input + slot extra (color picker) + Agregar/Cancelar. */
export default function TaxonomyAddInput({
  value,
  placeholder,
  ariaLabel,
  activeColor,
  inputRef,
  extra,
  renderExtraInput,
  setExtra,
  onChange,
  onCancel,
  onCommit,
}: Props) {
  const activeVar = getActiveColorVar(activeColor);

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onCommit();
          }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={placeholder}
        className="rounded-full px-3 py-1.5 text-sm border outline-none focus:ring-1"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-dark)',
          background: 'var(--color-white)',
          width: ADD_INPUT_WIDTH,
        }}
      />
      {renderExtraInput?.(extra, setExtra)}
      <button
        type="button"
        onClick={onCommit}
        className="rounded-full px-3 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
        style={{ color: activeVar, borderColor: activeVar }}
      >
        Agregar
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full px-2 py-1.5 text-sm transition-colors"
        style={{ color: 'var(--color-muted)' }}
        aria-label="Cancelar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
