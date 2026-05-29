"use client";

import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback } from "react";

import { useAnchorNavigation } from "./useAnchorNavigation";
import { useDesktopSearch } from "./useDesktopSearch";
import { useMobileDrawer } from "./useMobileDrawer";
import { useScrollBehavior } from "./useScrollBehavior";

/**
 * Orquestador del Navbar — compone los hooks especializados:
 *
 *  - useScrollBehavior:    detecta scroll para alternar el background.
 *  - useMobileDrawer:      estado del drawer mobile + ESC scopeado + auto-focus.
 *  - useDesktopSearch:     query, resultados, debounce y click-outside.
 *  - useAnchorNavigation:  scroll-to-anchor con manejo cross-page.
 *
 * Solo coordina handlers de submit/click que cruzan varios hooks. Mantiene
 * la API pública usada por `<Navbar />` (ver `index.tsx`).
 */
export function useNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isScrolled = useScrollBehavior();
  const drawer = useMobileDrawer();
  const search = useDesktopSearch();

  // El Navbar es "hero-aware": solo la landing (`/`) tiene el hero oscuro a
  // pantalla completa. Mientras no se scrollee, los items van en crema sobre la
  // foto; al scrollear (o en otras rutas) vuelven al rojo/tinta por defecto.
  const overHero = pathname === "/" && !isScrolled;

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
    // Drawer
    isDrawerOpen: drawer.isOpen,
    setIsDrawerOpen: drawer.setOpen,
    openDrawer,
    searchInputRef: drawer.searchInputRef,

    // Scroll
    isScrolled,
    overHero,

    // Search
    searchQuery: search.searchQuery,
    setSearchQuery: search.setSearchQuery,
    searchResults: search.searchResults,
    desktopSearchRef: search.desktopSearchRef,
    clearSearch: search.clearSearch,

    // Navigation
    handleNavigate,
    handleSearchSubmit,
    handleResultClick,
  };
}
