"use client";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import {
  HERO_SLIDES,
  REDUCED_TRANSITION,
  REDUCED_VARIANTS,
  SLIDE_TRANSITION,
  SLIDE_VARIANTS,
} from "./constants";
import HeroArrowButton from "./HeroArrowButton";
import HeroDots from "./HeroDots";
import { useHeroCarousel } from "./useHeroCarousel";

// Hero OSCURO (overlay cinematográfico): scrims oscuros que garantizan el
// contraste del texto blanco y el Navbar crema sobre CUALQUIER zona de la foto.
//  - DIAGONAL (to top-right): vignette principal — oscuro abajo-izquierda
//    (donde vive el texto en desktop) → claro arriba-derecha (las flores).
//  - TOP: banda fina para el Navbar.
//  - MOBILE (sm:hidden): en portrait el bloque de texto ocupa más alto, así
//    que se oscurece el tercio-medio inferior un poco más.
const SCRIM_DIAGONAL =
  "linear-gradient(to top right, color-mix(in srgb, var(--color-dark) 68%, transparent) 0%, color-mix(in srgb, var(--color-dark) 20%, transparent) 42%, transparent 68%)";
const SCRIM_TOP =
  "linear-gradient(to bottom, color-mix(in srgb, var(--color-dark) 44%, transparent) 0%, transparent 20%)";
const SCRIM_MOBILE =
  "linear-gradient(to top, color-mix(in srgb, var(--color-dark) 74%, transparent) 0%, color-mix(in srgb, var(--color-dark) 42%, transparent) 45%, color-mix(in srgb, var(--color-dark) 16%, transparent) 70%, transparent 90%)";

/**
 * Fondo full-bleed del Hero: carousel de fotos a pantalla completa con
 * autoplay, swipe táctil, flechas y dots. `isolate` aísla su z-stack interno
 * (`--z-hero-overlay`) para que nunca tape al contenido superpuesto, que se
 * pinta encima por orden del DOM.
 */
export default function HeroBackground() {
  const c = useHeroCarousel({ slidesCount: HERO_SLIDES.length });
  const currentSlide = HERO_SLIDES[c.slideIndex];
  const variants = c.prefersReducedMotion ? REDUCED_VARIANTS : SLIDE_VARIANTS;
  const transition = c.prefersReducedMotion ? REDUCED_TRANSITION : SLIDE_TRANSITION;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="absolute inset-0 isolate overflow-hidden"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Galería de arreglos florales"
        onTouchStart={c.handleTouchStart}
        onTouchEnd={c.handleTouchEnd}
      >
        {/* aria-live=off: el autoplay anunciaría cambios constantes. */}
        <div aria-live="off" className="absolute inset-0">
          <AnimatePresence initial={false}>
            <m.div
              key={c.page}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute inset-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${c.slideIndex + 1} de ${HERO_SLIDES.length}: ${currentSlide.label}`}
            >
              <Image
                src={currentSlide.image}
                alt={currentSlide.label}
                fill
                priority={c.slideIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            </m.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-0" style={{ background: SCRIM_DIAGONAL }} />
        <div className="pointer-events-none absolute inset-0 sm:hidden" style={{ background: SCRIM_MOBILE }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: SCRIM_TOP }} />

        <HeroArrowButton side="left" Icon={ChevronLeft} label="Slide anterior" onClick={() => { c.paginate(-1); }} />
        <HeroArrowButton side="right" Icon={ChevronRight} label="Siguiente slide" onClick={() => { c.paginate(1); }} />

        <HeroDots
          slides={HERO_SLIDES}
          activeIndex={c.slideIndex}
          onSelect={c.goToSlide}
          prefersReducedMotion={c.prefersReducedMotion}
          positionClassName="right-6 bottom-28 sm:bottom-24"
        />
      </div>
    </LazyMotion>
  );
}
