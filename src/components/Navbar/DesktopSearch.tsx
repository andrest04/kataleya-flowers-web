"use client";

import type { FormEvent, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SearchResult } from "./constants";

interface DesktopSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  isScrolled: boolean;
  desktopSearchRef: RefObject<HTMLDivElement>;
  clearSearch: () => void;
}

export default function DesktopSearch({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  handleResultClick,
  isScrolled,
  desktopSearchRef,
  clearSearch,
}: DesktopSearchProps) {
  return (
    <div ref={desktopSearchRef} className="relative">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300"
        style={{
          backgroundColor: isScrolled
            ? "var(--color-surface)"
            : "color-mix(in srgb, var(--color-cream) 80%, transparent)",
          border: "1px solid var(--color-border)",
        }}
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar flores..."
          className="w-32 bg-transparent text-sm outline-none lg:w-48"
          style={{ color: "var(--color-dark)", fontFamily: "var(--font-body)" }}
          aria-label="Buscar productos"
          aria-autocomplete="list"
          aria-controls="search-dropdown"
        />
        <button type="submit" className="shrink-0 cursor-pointer" aria-label="Buscar">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "var(--color-muted)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Dropdown de autocomplete — desktop */}
      {searchResults.length > 0 && (
        <div
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
            <button
              key={`${result.categorySlug}/${result.slug}`}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => handleResultClick(result.categorySlug, result.slug)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
              style={{ borderBottom: "1px solid var(--color-border)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={result.imageUrl}
                  alt={result.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{
                    color: "var(--color-dark)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {result.name}
                </p>
                <p
                  className="truncate text-xs"
                  style={{
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {result.categoryName}
                </p>
              </div>
              <span
                className="shrink-0 text-sm font-medium"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {result.hasVariants ? "Desde " : ""}S/{result.price}
              </span>
            </button>
          ))}
          <Link
            href={`/catalogo?q=${encodeURIComponent(searchQuery)}`}
            onClick={clearSearch}
            className="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-xs tracking-[0.06em] uppercase transition-colors duration-150"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Ver todos los resultados
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
