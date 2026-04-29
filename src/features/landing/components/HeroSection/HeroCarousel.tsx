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

const OVERLAY_Z = { zIndex: "var(--z-hero-overlay)" } as const;
const SLIDE_OVERLAY_GRADIENT =
  "linear-gradient(to top, color-mix(in srgb, var(--color-dark) 50%, transparent) 0%, color-mix(in srgb, var(--color-dark) 25%, transparent) 40%, transparent 70%)";

export default function HeroCarousel() {
  const c = useHeroCarousel({ slidesCount: HERO_SLIDES.length });
  const currentSlide = HERO_SLIDES[c.slideIndex];
  const variants = c.prefersReducedMotion ? REDUCED_VARIANTS : SLIDE_VARIANTS;
  const transition = c.prefersReducedMotion ? REDUCED_TRANSITION : SLIDE_TRANSITION;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="relative h-64 overflow-hidden rounded-3xl sm:h-80 lg:h-[440px]"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Galería de arreglos florales"
        onTouchStart={c.handleTouchStart}
        onTouchEnd={c.handleTouchEnd}
      >
        <div
          className="absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-white) 95%, transparent)", ...OVERLAY_Z }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none" style={{ backgroundColor: "var(--color-accent)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--color-dark)" }}>Certificadas Frescas</span>
        </div>

        {/* aria-live=off: autoplay (4s) anunciaría cambios constantes. */}
        <div aria-live="off" aria-atomic="true" className="absolute inset-0">
          <AnimatePresence initial={false} custom={c.direction}>
            <m.div
              key={c.page} custom={c.direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={transition}
              className="absolute inset-0" role="group" aria-roledescription="slide"
              aria-label={`Slide ${c.slideIndex + 1} de ${HERO_SLIDES.length}: ${currentSlide.label}`}
            >
              <Image src={currentSlide.image} alt={currentSlide.label} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0" style={{ background: SLIDE_OVERLAY_GRADIENT }} />
              <div className="absolute right-6 bottom-6 left-6 text-white">
                <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{currentSlide.label}</p>
                <p className="text-sm opacity-90">{currentSlide.sublabel}</p>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        <HeroArrowButton side="left" Icon={ChevronLeft} label="Slide anterior" onClick={() => { c.paginate(-1); }} />
        <HeroArrowButton side="right" Icon={ChevronRight} label="Siguiente slide" onClick={() => { c.paginate(1); }} />

        <div className="absolute right-0 bottom-1 left-0 flex justify-center sm:hidden" style={OVERLAY_Z}>
          <span className="text-xs font-medium text-white/60">Desliza para ver más</span>
        </div>

        <HeroDots slides={HERO_SLIDES} activeIndex={c.slideIndex} onSelect={c.goToSlide} />
      </div>
    </LazyMotion>
  );
}
