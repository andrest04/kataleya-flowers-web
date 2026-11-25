"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseMobileDrawerResult {
  isOpen: boolean;
  hasOpened: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export function useMobileDrawer(): UseMobileDrawerResult {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setOpen = useCallback((next: boolean) => {
    setIsOpen(next);
    if (next) setHasOpened(true);
  }, []);

  const open = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  return {
    isOpen,
    hasOpened,
    open,
    close,
    setOpen,
    searchInputRef,
  };
}
