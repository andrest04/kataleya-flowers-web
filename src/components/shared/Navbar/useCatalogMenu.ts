"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCatalogMenu } from "@/features/catalog/actions/getCatalogMenu";
import type { Category } from "@/features/catalog/types";

const CLOSE_DELAY_MS = 150;

interface UseCatalogMenuResult {
  isCatalogMenuOpen: boolean;
  categories: Category[] | null;
  catalogMenuRef: RefObject<HTMLDivElement | null>;
  openCatalogMenu: () => void;
  scheduleCloseCatalogMenu: () => void;
  cancelCloseCatalogMenu: () => void;
  closeCatalogMenu: () => void;
}

export function useCatalogMenu(): UseCatalogMenuResult {
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const catalogMenuRef = useRef<HTMLDivElement>(null);
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
    setIsCatalogMenuOpen(true);
  }, [cancelCloseCatalogMenu]);

  useEffect(() => cancelCloseCatalogMenu, [cancelCloseCatalogMenu]);

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
    openCatalogMenu,
    scheduleCloseCatalogMenu,
    cancelCloseCatalogMenu,
    closeCatalogMenu,
  };
}
