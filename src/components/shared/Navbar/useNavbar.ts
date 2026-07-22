"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback } from "react";

import { useAnchorNavigation } from "./useAnchorNavigation";
import { useDesktopSearch } from "./useDesktopSearch";
import { useMobileDrawer } from "./useMobileDrawer";
import { useScrollBehavior } from "./useScrollBehavior";

export function useNavbar() {
  const router = useRouter();
  const isScrolled = useScrollBehavior();
  const drawer = useMobileDrawer();
  const search = useDesktopSearch();

  const handleNavigate = useAnchorNavigation({
    isDrawerOpen: drawer.isOpen,
    closeDrawer: drawer.close,
  });

  const closeAll = useCallback(() => {
    search.clearSearch();
    drawer.close();
  }, [search, drawer]);

  const openDrawer = useCallback(() => {
    search.clearSearch();
    drawer.open();
  }, [search, drawer]);

  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const q = search.searchQuery.trim();
      if (!q) return;
      closeAll();
      router.push(`/catalogo?q=${encodeURIComponent(q)}`);
    },
    [search.searchQuery, closeAll, router],
  );

  const handleResultClick = useCallback(
    (categorySlug: string, productSlug: string) => {
      closeAll();
      router.push(`/catalogo/${categorySlug}/${productSlug}`);
    },
    [closeAll, router],
  );

  return {
    isDrawerOpen: drawer.isOpen,
    setIsDrawerOpen: drawer.setOpen,
    openDrawer,
    searchInputRef: drawer.searchInputRef,

    isScrolled,

    searchQuery: search.searchQuery,
    setSearchQuery: search.setSearchQuery,
    searchResults: search.searchResults,
    desktopSearchRef: search.desktopSearchRef,
    clearSearch: search.clearSearch,

    handleNavigate,
    handleSearchSubmit,
    handleResultClick,
  };
}
