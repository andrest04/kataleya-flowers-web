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
export const AUTOPLAY_INTERVAL = 4000;

/** Distancia mínima en px para considerar un swipe en touch. */
export const SWIPE_THRESHOLD = 50;

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 1,
    image: "/images/hero/arreglos.webp",
    bgColor: "var(--color-primary)",
    label: "Arreglos Hoy",
    sublabel: "Diseño personalizado, entrega rápida en Lima",
  },
  {
    id: 2,
    image: "/images/hero/orquideas.webp",
    bgColor: "var(--color-accent)",
    label: "Orquídeas Seleccionadas",
    sublabel: "Las variedades más finas, disponibles ahora",
  },
  {
    id: 3,
    image: "/images/hero/regalos.webp",
    bgColor: "var(--color-secondary)",
    label: "Regalos Premium",
    sublabel: "Flores frescas para ocasiones especiales",
  },
];

/** Variantes de animación para el slide cuando NO hay reduced-motion. */
export const SLIDE_VARIANTS: SlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/** Variantes simplificadas (solo opacity) cuando el usuario pidió reduced-motion. */
export const REDUCED_VARIANTS: SlideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SLIDE_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const REDUCED_TRANSITION: Transition = {
  duration: 0.3,
};
