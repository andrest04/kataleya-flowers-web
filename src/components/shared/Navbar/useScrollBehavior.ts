"use client";

import { useEffect, useState } from "react";

/**
 * Hook que rastrea si la página fue scrolleada más allá de un umbral.
 *
 * Responsabilidad única: leer `window.scrollY` y exponer un boolean.
 * El listener es passive para no bloquear el scroll. React hace bail-out
 * cuando `setIsScrolled` recibe el mismo boolean, así que solo re-renderiza
 * en el cruce del umbral.
 *
 * @param threshold píxeles desde el top a partir de los cuales se considera "scrolleado".
 */
export function useScrollBehavior(threshold = 60): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}
