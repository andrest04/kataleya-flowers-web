"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback } from "react";

import { useAnchorNavigation } from "./useAnchorNavigation";
import { useCatalogMenu } from "./useCatalogMenu";
import { useDesktopSearch } from "./useDesktopSearch";
import { useHeaderVisibility } from "./useHeaderVisibility";
import { useMobileDrawer } from "./useMobileDrawer";
import { useScrollBehavior } from "./useScrollBehavior";

export function useNavbar() {
  const router = useRouter();
  const isScrolled = useScrollBehavior();
  const drawer = useMobileDrawer();
  const search = useDesktopSearch();
  const catalogMenu = useCatalogMenu();
  const isHeaderHidden = useHeaderVisibility(
    180,
    search.isSearchOpen || catalogMenu.isCatalogMenuOpen,
  );

  const handleNavigate = useAnchorNavigation({
    isDrawerOpen: drawer.isOpen,
    closeDrawer: drawer.close,
  });

  const closeAll = useCallback(() => {
    search.closeSearch();
    catalogMenu.closeCatalogMenu();
    drawer.close();
  }, [search, catalogMenu, drawer]);

  const openDrawer = useCallback(() => {
    search.closeSearch();
    catalogMenu.closeCatalogMenu();
    drawer.open();
  }, [search, catalogMenu, drawer]);

  const openCatalogMenu = useCallback(() => {
    search.closeSearch();
    catalogMenu.openCatalogMenu();
  }, [search, catalogMenu]);

  const openSearch = useCallback(() => {
    catalogMenu.closeCatalogMenu();
    search.openSearch();
  }, [search, catalogMenu]);

  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const q = search.searchQuery.trim();
      if (!q) return;
      closeAll();
      router.push(`/buscar?q=${encodeURIComponent(q)}`);
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
    isHeaderHidden,

    isSearchOpen: search.isSearchOpen,
    openSearch,
    closeSearch: search.closeSearch,
    searchQuery: search.searchQuery,
    setSearchQuery: search.setSearchQuery,
    searchResults: search.searchResults,
    suggestions: search.suggestions,
    desktopSearchRef: search.desktopSearchRef,
    clearSearch: search.clearSearch,

    isCatalogMenuOpen: catalogMenu.isCatalogMenuOpen,
    catalogMenuCategories: catalogMenu.categories,
    catalogMenuRef: catalogMenu.catalogMenuRef,
    openCatalogMenu,
    scheduleCloseCatalogMenu: catalogMenu.scheduleCloseCatalogMenu,
    cancelCloseCatalogMenu: catalogMenu.cancelCloseCatalogMenu,
    closeCatalogMenu: catalogMenu.closeCatalogMenu,

    handleNavigate,
    handleSearchSubmit,
    handleResultClick,
  };
}
