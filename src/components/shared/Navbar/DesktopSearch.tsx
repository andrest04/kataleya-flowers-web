"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import type { FormEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import SearchResultItem from "@/components/shared/SearchResultItem";

import type { SearchResult } from "./constants";

interface DesktopSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

export default function DesktopSearch({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  handleResultClick,
  desktopSearchRef,
  clearSearch,
}: DesktopSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedQuery = searchQuery.trim();
  const isExpanded = searchResults.length > 0;

  const handleClose = useCallback(() => {
    setIsOpen(false);
    clearSearch();
  }, [clearSearch]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, desktopSearchRef, handleClose]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
      </button>
    );
  }

  return (
    <div ref={desktopSearchRef} className="relative">
      <form
        onSubmit={handleSearchSubmit}
        role="search"
        className="flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 transition-colors duration-300"
      >
        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar flores..."
          className="w-32 bg-transparent font-body text-sm text-(--color-dark) outline-none lg:w-48"
          aria-label="Buscar productos"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isExpanded}
          aria-controls="search-dropdown"
        />
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 cursor-pointer text-(--color-muted)"
          aria-label="Cerrar búsqueda"
        >
          <X className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
        </button>
      </form>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {trimmedQuery.length === 0
          ? ""
          : searchResults.length === 0
            ? "Sin resultados"
            : `${searchResults.length} resultado${
                searchResults.length === 1 ? "" : "s"
              }`}
      </p>

      {isExpanded && (
        <ul
          id="search-dropdown"
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute top-full right-0 mt-2 w-80 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "var(--color-cream)",
            border: "1px solid var(--color-border)",
            boxShadow:
              "0 8px 32px color-mix(in srgb, var(--color-dark) 12%, transparent)",
          }}
        >
          {searchResults.map((result) => (
            <li
              key={`${result.categorySlug}/${result.slug}`}
              role="option"
              aria-selected={false}
            >
              <SearchResultItem
                imageUrl={result.imageUrl}
                name={result.name}
                subtitle={result.categoryName}
                price={`${result.hasVariants ? "Desde " : ""}S/${result.price}`}
                onClick={() =>
                  handleResultClick(result.categorySlug, result.slug)
                }
              />
            </li>
          ))}
          <li>
            <Link
              href={`/catalogo?q=${encodeURIComponent(searchQuery)}`}
              onClick={clearSearch}
              className="flex w-full items-center justify-center gap-1.5 px-4 py-3 font-body text-xs tracking-[0.06em] text-(--color-primary) uppercase transition-colors duration-150 hover:bg-(--color-surface)"
            >
              Ver todos los resultados
              <ChevronRight
                className="h-3 w-3"
                aria-hidden="true"
                strokeWidth={2}
              />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
