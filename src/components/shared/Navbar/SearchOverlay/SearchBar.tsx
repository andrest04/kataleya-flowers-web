"use client";

import { Search, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef } from "react";

import { PANEL_CONTAINER } from "./constants";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  closeSearch: () => void;
  isExpanded: boolean;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  closeSearch,
  isExpanded,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      onSubmit={handleSearchSubmit}
      role="search"
      className={`flex h-16 w-full items-center gap-4 ${PANEL_CONTAINER}`}
    >
      <Search
        className="h-5 w-5 shrink-0 text-(--color-muted)"
        aria-hidden="true"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar flores..."
        className="w-full bg-transparent font-body text-base text-(--color-dark) outline-none [&::-webkit-search-cancel-button]:appearance-none"
        aria-label="Buscar productos"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isExpanded}
        aria-controls="search-panel"
      />
      <button
        type="button"
        onClick={closeSearch}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-border) text-(--color-dark) transition-colors duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
        aria-label="Cerrar búsqueda"
      >
        <X className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
      </button>
    </form>
  );
}
