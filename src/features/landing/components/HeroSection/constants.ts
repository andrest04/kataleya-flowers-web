import type { Transition } from "framer-motion";

import type { CampaignMode, HeroSlide, SlideVariants } from "./types";

/**
 * Cambia el CTA principal del Hero.
 *  - 'contact': prioriza Pedir por WhatsApp.
 *  - 'catalog': prioriza Ver Catálogo.
 *
 * NOTA: este toggle se evalúa en el server (HeroSection es Server-Composition
 * que pasa el modo a HeroContent). Cambiar requiere redeploy.
 * TODO Fase 4: mover a `process.env.NEXT_PUBLIC_CAMPAIGN_MODE`.
 */
export const CAMPAIGN_MODE: CampaignMode = "contact";

/** Intervalo entre auto-rotaciones del carousel. Pausa con prefers-reduced-motion. */
export const AUTOPLAY_INTERVAL = 5500;

/** Distancia mínima en px para considerar un swipe en touch. */
export const SWIPE_THRESHOLD = 50;

/**
 * Slides del hero full-bleed. `label` se usa como alt accesible de cada foto:
 * describe la flor como objeto físico, no la categoría genérica.
 */
export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 1,
    image: "/images/hero/rosas.jpg",
    bgColor: "var(--color-primary)",
    label: "Ramo de rosas en tonos rosados y rojos envuelto para regalo",
    sublabel: "Diseño personalizado, entrega rápida en Lima",
    focus: "70% center",
  },
  {
    id: 2,
    image: "/images/hero/peonias.jpg",
    bgColor: "var(--color-accent)",
    label: "Arreglo de peonías y ranúnculos con eucalipto en florero de cerámica",
    sublabel: "Las variedades más finas, disponibles ahora",
    focus: "82% center",
  },
  {
    id: 3,
    image: "/images/hero/gerberas.jpg",
    bgColor: "var(--color-secondary)",
    label: "Gerberas multicolor frescas en tonos vivos",
    sublabel: "Flores frescas para ocasiones especiales",
    focus: "76% center",
  },
];

/**
 * Fondo full-bleed: crossfade + Ken Burns lento. El fade entra con ease-out
 * exponencial (1.1s) y el zoom corre mientras el slide está visible (scale 6s
 * lineal), dando sensación de cámara viva sin movimiento brusco.
 */
export const SLIDE_VARIANTS: SlideVariants = {
  enter: { opacity: 0, scale: 1.06 },
  center: { opacity: 1, scale: 1 },
  // El exit lleva su propia transición corta: así AnimatePresence remueve el
  // slide saliente enseguida en vez de esperar los 6s del Ken Burns (scale).
  exit: {
    opacity: 0,
    scale: 1.04,
    transition: {
      opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
      scale: { duration: 0.9, ease: "linear" },
    },
  },
};

/** Variantes simplificadas (solo opacity) cuando el usuario pidió reduced-motion. */
export const REDUCED_VARIANTS: SlideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SLIDE_TRANSITION: Transition = {
  opacity: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  scale: { duration: 6, ease: "linear" },
};

export const REDUCED_TRANSITION: Transition = {
  duration: 0.4,
};
