"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import type { FormEvent, RefObject } from "react";

import SearchResultItem from "@/components/shared/SearchResultItem";

import type { SearchResult } from "./constants";

interface DesktopSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  isScrolled: boolean;
  /** True sobre el hero oscuro: search translúcido con texto crema. */
  overHero: boolean;
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

export default function DesktopSearch({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  handleResultClick,
  isScrolled,
  overHero,
  desktopSearchRef,
  clearSearch,
}: DesktopSearchProps) {
  const trimmedQuery = searchQuery.trim();
  const isExpanded = searchResults.length > 0;

  return (
    <div ref={desktopSearchRef} className="relative">
      <form
        onSubmit={handleSearchSubmit}
        role="search"
        className="flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300"
        style={{
          backgroundColor: overHero
            ? "color-mix(in srgb, var(--color-cream) 12%, transparent)"
            : isScrolled
              ? "var(--color-surface)"
              : "color-mix(in srgb, var(--color-cream) 80%, transparent)",
          border: overHero
            ? "1px solid color-mix(in srgb, var(--color-cream) 35%, transparent)"
            : "1px solid var(--color-border)",
        }}
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar flores..."
          className={`w-32 bg-transparent font-body text-sm outline-none lg:w-48 ${
            overHero
              ? "text-(--color-cream) placeholder:text-(--color-cream)/70"
              : "text-(--color-dark)"
          }`}
          aria-label="Buscar productos"
          // ARIA combobox pattern: input controla un listbox externo.
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isExpanded}
          aria-controls="search-dropdown"
        />
        <button
          type="submit"
          className={`shrink-0 cursor-pointer ${overHero ? "text-(--color-cream)" : "text-(--color-muted)"}`}
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
        </button>
      </form>

      {/* Anuncia la cantidad de resultados a screen readers. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {trimmedQuery.length === 0
          ? ""
          : searchResults.length === 0
            ? "Sin resultados"
            : `${searchResults.length} resultado${
                searchResults.length === 1 ? "" : "s"
              }`}
      </p>

      {/* Dropdown de autocomplete — desktop */}
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
