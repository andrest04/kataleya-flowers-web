'use client';

import { Search, X } from 'lucide-react';
import { useId } from 'react';

import { INPUT_CLS } from './constants';

interface CatalogSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CatalogSearchInput({
  value,
  onChange,
  placeholder = 'Buscar ramos, flores...',
}: CatalogSearchInputProps) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-(--color-muted)"
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_CLS} w-full pl-10 pr-10 py-2.5`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4 text-(--color-muted)" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
