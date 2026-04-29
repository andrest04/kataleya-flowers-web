"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

interface UseAnchorNavigationOptions {
  /**
   * Cuando es `true`, el navbar cierra el drawer mobile antes de scrollear.
   * Si no está abierto, el scroll es inmediato.
   */
  isDrawerOpen: boolean;
  /** Cierra el drawer (delegado al hook que lo posee). */
  closeDrawer: () => void;
}

/**
 * Hook que centraliza la navegación a anchors de la landing page.
 *
 * Reglas:
 *  - Si la URL actual NO es la landing (ej. `/catalogo`), forzamos un
 *    `window.location.href = '/#target'` para que el browser navegue y
 *    luego scrollee al anchor.
 *  - Si estamos en la landing y el target existe, scroll suave.
 *  - Si el drawer mobile está abierto, esperamos 320ms para que termine
 *    su animación de cierre antes de scrollear (evita jank).
 *
 * Devuelve un único callback `handleNavigate(href)` que acepta:
 *  - `#anchor`     → scroll al `#anchor` de la landing
 *  - `/path#anchor` → toma el `#anchor` y aplica las mismas reglas
 *  - cualquier otro string sin `#` → cierra el drawer y no hace nada
 */
export function useAnchorNavigation({
  isDrawerOpen,
  closeDrawer,
}: UseAnchorNavigationOptions) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return useCallback(
    (href: string) => {
      const targetId = href.startsWith("#")
        ? href.slice(1)
        : href.split("#")[1];

      if (!targetId) {
        closeDrawer();
        return;
      }

      if (!isLandingPage) {
        closeDrawer();
        window.location.href = `/#${targetId}`;
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) {
        console.warn(`[Navbar] Target element with id "${targetId}" not found`);
        closeDrawer();
        return;
      }

      const scrollToTarget = () => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      if (isDrawerOpen) {
        closeDrawer();
        // Esperamos que termine el cierre del Sheet antes de scrollear,
        // para que el smooth-scroll no compita con la animación.
        window.setTimeout(scrollToTarget, 320);
        return;
      }

      scrollToTarget();
    },
    [isDrawerOpen, isLandingPage, closeDrawer],
  );
}
