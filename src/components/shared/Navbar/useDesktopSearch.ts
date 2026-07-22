"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SearchSuggestions } from "@/features/catalog/actions/getSearchSuggestions";
import { getSearchSuggestions } from "@/features/catalog/actions/getSearchSuggestions";
import { searchProducts } from "@/features/catalog/actions/searchProducts";

import type { SearchResult } from "./constants";

const DEBOUNCE_MS = 250;

interface UseDesktopSearchResult {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  suggestions: SearchSuggestions | null;
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

export function useDesktopSearch(): UseDesktopSearchResult {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQueryState] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(
    null,
  );
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const setSearchQuery = useCallback((next: string) => {
    setSearchQueryState(next);
    if (!next.trim()) {
      setSearchResults([]);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
    setSearchResults([]);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    clearSearch();
  }, [clearSearch]);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  useEffect(() => {
    if (!isSearchOpen || suggestions) return;

    let stale = false;
    getSearchSuggestions()
      .then((result) => {
        if (!stale) setSuggestions(result);
      })
      .catch((err: unknown) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[Navbar] getSearchSuggestions failed:", err);
        }
      });

    return () => {
      stale = true;
    };
  }, [isSearchOpen, suggestions]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    let stale = false;
    const timer = window.setTimeout(() => {
      searchProducts(q)
        .then((results) => {
          if (!stale) setSearchResults(results);
        })
        .catch((err: unknown) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("[Navbar] searchProducts failed:", err);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    suggestions,
    desktopSearchRef,
    clearSearch,
  };
}
