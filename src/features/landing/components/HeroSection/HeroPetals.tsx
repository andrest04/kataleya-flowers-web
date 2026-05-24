"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Carga la escena Three.js solo en el cliente. SSR=false evita
 * romper el render del hero por WebGL inexistente en el server.
 */
const HeroPetalsScene = dynamic(() => import("./HeroPetalsScene"), {
  ssr: false,
});

/**
 * Wrapper cliente del fondo 3D del Hero. Respeta `prefers-reduced-motion`
 * y solo monta la escena después del primer paint para no competir con LCP.
 */
export default function HeroPetals() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    // Diferimos el montaje al idle más cercano para no bloquear LCP.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const id = schedule(() => setEnabled(true));

    return () => {
      if (typeof id === "number") clearTimeout(id);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ contain: "strict" }}
    >
      <HeroPetalsScene />
    </div>
  );
}
