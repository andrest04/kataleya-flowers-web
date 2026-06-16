"use client";

import { m } from "framer-motion";

import { AUTOPLAY_INTERVAL } from "./constants";
import type { HeroSlide } from "./types";

interface HeroDotsProps {
  readonly slides: readonly HeroSlide[];
  readonly activeIndex: number;
  readonly onSelect: (index: number) => void;
  /** Pausa la animación de progreso si el usuario pidió reduced-motion. */
  readonly prefersReducedMotion: boolean;
  /** Posición del cluster de dots. Por defecto, esquina inferior derecha. */
  readonly positionClassName?: string;
}

// Hero oscuro: dots/barra en crema para que lean sobre la foto + scrim.
const TRACK_BG = "color-mix(in srgb, var(--color-cream) 32%, transparent)";
const INACTIVE_BG = "color-mix(in srgb, var(--color-cream) 55%, transparent)";

/**
 * Indicador de slides en formato barra. La marca activa es una línea larga
 * con una barra de progreso (blanca) que se llena vía `scaleX` durante el
 * autoplay (`AUTOPLAY_INTERVAL`); al completarse entra el próximo slide.
 * `key={activeIndex}` remonta la barra en cada cambio para reiniciar el llenado.
 */
export default function HeroDots({
  slides,
  activeIndex,
  onSelect,
  prefersReducedMotion,
  positionClassName = "right-4 bottom-4",
}: HeroDotsProps) {
  return (
    <div
      className={`absolute flex items-center gap-2 ${positionClassName}`}
      style={{ zIndex: "var(--z-hero-overlay)" }}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={slide.id}
            type="button"
            onClick={() => {
              onSelect(index);
            }}
            className="flex h-6 cursor-pointer items-center"
            aria-label={`Ir a slide ${index + 1}`}
            aria-current={isActive}
          >
            <span
              className="block h-1.5 overflow-hidden rounded-full transition-all duration-500"
              style={{
                width: isActive ? "48px" : "20px",
                backgroundColor: isActive ? TRACK_BG : INACTIVE_BG,
              }}
            >
              {isActive && (
                <m.span
                  key={activeIndex}
                  className="block h-full w-full origin-left rounded-full"
                  style={{ backgroundColor: "var(--color-cream)" }}
                  initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }
                  }
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
