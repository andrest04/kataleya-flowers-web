"use client";

import Link from "next/link";
import { useRef } from "react";

import type { SearchResult } from "../constants";
import { PANEL_CONTAINER, SCROLLBAR_HIDDEN } from "./constants";
import HorizontalScrollBar from "./HorizontalScrollBar";
import SearchResultCard from "./SearchResultCard";

interface SearchResultsPanelProps {
  searchQuery: string;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  closeSearch: () => void;
}

export default function SearchResultsPanel({
  searchQuery,
  searchResults,
  handleResultClick,
  closeSearch,
}: SearchResultsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (searchResults.length === 0) {
    return (
      <p className={`${PANEL_CONTAINER} py-12 text-center font-body text-sm text-(--color-muted)`}>
        Sin resultados para &ldquo;{searchQuery.trim()}&rdquo;
      </p>
    );
  }

  const categories = Array.from(
    new Map(
      searchResults
        .filter((result) => result.categorySlug)
        .map((result) => [result.categorySlug, result.categoryName]),
    ).entries(),
  );

  return (
    <div className={`${PANEL_CONTAINER} pt-6 pb-15`}>
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-10">
        {categories.length > 0 && (
          <div className="lg:w-64 lg:shrink-0 lg:border-r lg:border-(--color-border) lg:pr-10">
            <h3 className="mb-6 font-body text-sm font-semibold text-(--color-dark)">
              Categorías
            </h3>
            <ul className="flex flex-wrap items-start gap-3 lg:flex-col">
              {categories.map(([slug, name]) => (
                <li key={slug}>
                  <Link
                    href={`/catalogo/${slug}`}
                    onClick={closeSearch}
                    className="inline-block rounded-md border border-(--color-border) px-4 py-2 font-body text-sm text-(--color-dark) transition-colors duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h3 className="font-body text-sm font-semibold text-(--color-dark)">
              Productos ({searchResults.length} resultado
              {searchResults.length === 1 ? "" : "s"})
            </h3>
            <Link
              href={`/catalogo?q=${encodeURIComponent(searchQuery)}`}
              onClick={closeSearch}
              className="shrink-0 font-body text-xs font-semibold tracking-[0.06em] text-(--color-primary) uppercase underline-offset-4 hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div
            ref={scrollRef}
            className={`flex gap-8 overflow-x-auto lg:gap-10 ${SCROLLBAR_HIDDEN}`}
          >
            {searchResults.map((result) => (
              <SearchResultCard
                key={`${result.categorySlug}/${result.slug}`}
                result={result}
                onClick={() => handleResultClick(result.categorySlug, result.slug)}
                className="w-40 shrink-0 sm:w-48 lg:w-56"
              />
            ))}
          </div>
          <HorizontalScrollBar scrollRef={scrollRef} />
        </div>
      </div>
    </div>
  );
}
