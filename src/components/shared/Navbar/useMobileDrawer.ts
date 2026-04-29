"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseMobileDrawerResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Hook que maneja el estado del drawer mobile.
 *
 * Responsabilidades:
 *  - Estado open/close + setters memoizados.
 *  - Auto-focus del input de búsqueda al abrir (via timeout para esperar
 *    la animación del Sheet).
 *  - Escape key SCOPEADO: el listener solo se monta cuando el drawer
 *    está abierto, evitando race conditions con otros modales (lightbox,
 *    dialogs) que también escuchan Escape globalmente.
 *
 * NOTA SOBRE BODY SCROLL LOCK: NO se implementa acá. Radix `Dialog.Root`
 * (la base del `<Sheet>` que renderiza el drawer) ya bloquea el scroll
 * del body internamente vía `react-remove-scroll` mientras `open=true`.
 * Hacerlo en paralelo causaba que `overflow:""` se restaurara antes de
 * tiempo cuando otro modal seguía abierto. Se delega 100% a Radix.
 */
export function useMobileDrawer(): UseMobileDrawerResult {
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Auto-focus del input al abrir el drawer. Esperamos 150ms para que
  // termine la animación de entrada del Sheet (Radix anima la entrada
  // y un focus inmediato puede ser ignorado o causar jank).
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Escape SCOPEADO: solo escuchamos cuando el drawer está abierto.
  // Esto evita que ESC en cualquier parte de la app cierre algo que
  // ni siquiera está abierto, y deja a otros modales (con z-index
  // superior) manejar su propio Escape sin colisiones.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    setOpen: setIsOpen,
    searchInputRef,
  };
}
