"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  // Listener con referencia ESTABLE — sin esto, addEventListener y
  // removeEventListener reciben funciones distintas y nunca se desuscribe.
  mq.addEventListener("change", callback);
  return () => {
    mq.removeEventListener("change", callback);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Detecta `prefers-reduced-motion` con `useSyncExternalStore` —
 * SSR-safe (devuelve `false` en el server) y sin riesgo de leak.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
