"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchProducts } from "@/features/catalog/actions/searchProducts";

import type { SearchResult } from "./constants";

const DEBOUNCE_MS = 250;

interface UseDesktopSearchResult {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

export function useDesktopSearch(): UseDesktopSearchResult {
  const [searchQuery, setSearchQueryState] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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

  useEffect(() => {
    if (!searchQuery) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setSearchQueryState("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery]);

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
    searchQuery,
    setSearchQuery,
    searchResults,
    desktopSearchRef,
    clearSearch,
  };
}
