"use client";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import type { FormEvent, RefObject } from "react";

import type { SearchSuggestions } from "@/features/catalog/actions/getSearchSuggestions";

import type { SearchResult } from "../constants";
import SearchBar from "./SearchBar";
import SearchResultsPanel from "./SearchResultsPanel";
import SearchSuggestionsPanel from "./SearchSuggestionsPanel";

interface SearchOverlayProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  suggestions: SearchSuggestions | null;
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  closeSearch: () => void;
}

export default function SearchOverlay({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  suggestions,
  handleResultClick,
  desktopSearchRef,
  closeSearch,
}: SearchOverlayProps) {
  const showResults = searchQuery.trim().length > 0;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={desktopSearchRef}
        className="relative hidden w-full md:block"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchSubmit={handleSearchSubmit}
          closeSearch={closeSearch}
          isExpanded={showResults}
        />

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {!showResults
            ? ""
            : searchResults.length === 0
              ? "Sin resultados"
              : `${searchResults.length} resultado${searchResults.length === 1 ? "" : "s"}`}
        </p>

        <div
          id="search-panel"
          className="absolute inset-x-0 top-full w-full overflow-hidden border-t border-(--color-border) bg-(--color-cream)"
          style={{
            boxShadow:
              "0 16px 32px color-mix(in srgb, var(--color-dark) 12%, transparent)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showResults ? (
              <m.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <SearchResultsPanel
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  handleResultClick={handleResultClick}
                  closeSearch={closeSearch}
                />
              </m.div>
            ) : (
              <m.div
                key="suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <SearchSuggestionsPanel
                  suggestions={suggestions}
                  onNavigate={closeSearch}
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </LazyMotion>
  );
}
