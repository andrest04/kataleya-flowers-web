"use client";

import type { FocusEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCatalogMenu } from "@/features/catalog/actions/getCatalogMenu";
import type { Category } from "@/features/catalog/types";

const CLOSE_DELAY_MS = 150;

interface UseCatalogMenuResult {
  isCatalogMenuOpen: boolean;
  categories: Category[] | null;
  catalogMenuRef: RefObject<HTMLDivElement | null>;
  catalogTriggerRef: RefObject<HTMLButtonElement | null>;
  shouldFocusCatalogMenu: boolean;
  openCatalogMenu: () => void;
  toggleCatalogMenu: () => void;
  handleCatalogMenuBlur: (event: FocusEvent<HTMLElement>) => void;
  scheduleCloseCatalogMenu: () => void;
  cancelCloseCatalogMenu: () => void;
  closeCatalogMenu: () => void;
}

export function useCatalogMenu(): UseCatalogMenuResult {
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [shouldFocusCatalogMenu, setShouldFocusCatalogMenu] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const catalogMenuRef = useRef<HTMLDivElement>(null);
  const catalogTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelCloseCatalogMenu = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closeCatalogMenu = useCallback(() => {
    cancelCloseCatalogMenu();
    setIsCatalogMenuOpen(false);
  }, [cancelCloseCatalogMenu]);

  const scheduleCloseCatalogMenu = useCallback(() => {
    cancelCloseCatalogMenu();
    closeTimer.current = window.setTimeout(() => {
      setIsCatalogMenuOpen(false);
    }, CLOSE_DELAY_MS);
  }, [cancelCloseCatalogMenu]);

  const openCatalogMenu = useCallback(() => {
    cancelCloseCatalogMenu();
    setShouldFocusCatalogMenu(false);
    setIsCatalogMenuOpen(true);
  }, [cancelCloseCatalogMenu]);

  const toggleCatalogMenu = useCallback(() => {
    cancelCloseCatalogMenu();
    setShouldFocusCatalogMenu(true);
    setIsCatalogMenuOpen((open) => !open);
  }, [cancelCloseCatalogMenu]);

  const handleCatalogMenuBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget;
      if (!(next instanceof Node)) return;
      if (
        catalogMenuRef.current?.contains(next) ||
        catalogTriggerRef.current?.contains(next)
      ) {
        return;
      }
      closeCatalogMenu();
    },
    [closeCatalogMenu],
  );

  useEffect(() => cancelCloseCatalogMenu, [cancelCloseCatalogMenu]);

  useEffect(() => {
    if (!isCatalogMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const trigger = catalogTriggerRef.current;
      const focused = document.activeElement;
      const hadFocus =
        focused !== null &&
        (focused === trigger || catalogMenuRef.current?.contains(focused));
      closeCatalogMenu();
      if (hadFocus) trigger?.focus();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCatalogMenuOpen, closeCatalogMenu]);

  useEffect(() => {
    if (!isCatalogMenuOpen || categories) return;

    let stale = false;
    getCatalogMenu()
      .then((result) => {
        if (!stale) setCategories(result.categories);
      })
      .catch((err: unknown) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[Navbar] getCatalogMenu failed:", err);
        }
      });

    return () => {
      stale = true;
    };
  }, [isCatalogMenuOpen, categories]);

  return {
    isCatalogMenuOpen,
    categories,
    catalogMenuRef,
    catalogTriggerRef,
    shouldFocusCatalogMenu,
    openCatalogMenu,
    toggleCatalogMenu,
    handleCatalogMenuBlur,
    scheduleCloseCatalogMenu,
    cancelCloseCatalogMenu,
    closeCatalogMenu,
  };
}
