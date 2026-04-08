"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { BUSINESS } from "@/lib/constants";

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mq.matches);
    const timeoutId = window.setTimeout(update, 0);
    mq.addEventListener("change", (e) => setPrefersReduced(e.matches));
    return () => {
      window.clearTimeout(timeoutId);
      mq.removeEventListener("change", (e) => setPrefersReduced(e.matches));
    };
  }, []);

  return prefersReduced;
}
import Image from "next/image";
import HeroButtons from "./HeroButtons";
import TrustBar from "./TrustBar";

// Campaign mode: 'contact' prioritizes contacting, 'catalog' prioritizes browsing
type CampaignMode = "contact" | "catalog";
const CAMPAIGN_MODE: CampaignMode = "contact";
const AUTOPLAY_INTERVAL = 4000; // milliseconds

const slides = [
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

const slideVariants = {
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

export default function HeroSection() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [imageExists, setImageExists] = useState<Record<number, boolean>>({});
  const prefersReducedMotion = usePrefersReducedMotion();

  const slideIndex = ((page % slides.length) + slides.length) % slides.length;

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page],
  );

  const goToSlide = useCallback(
    (index: number) => {
      const newDirection = index > slideIndex ? 1 : -1;
      setPage([index, newDirection]);
    },
    [slideIndex],
  );

  // Touch / swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (delta > 50) {
      paginate(1); // swipe left → next
    } else if (delta < -50) {
      paginate(-1); // swipe right → prev
    }
  };

  // Auto-play every AUTOPLAY_INTERVAL milliseconds (disabled when reduced motion preferred)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      paginate(1);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paginate, prefersReducedMotion]);

  // Check if images exist
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new window.Image();
      img.onload = () =>
        setImageExists((prev) => ({ ...prev, [slide.id]: true }));
      img.onerror = () =>
        setImageExists((prev) => ({ ...prev, [slide.id]: false }));
      img.src = slide.image;
    });
  }, []);

  const currentSlide = slides[slideIndex];
  const hasImage = imageExists[currentSlide.id];

  const reducedVariants = useMemo(() => ({
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }), []);

  const activeVariants = prefersReducedMotion ? reducedVariants : slideVariants;
  const activeTransition = prefersReducedMotion
    ? { duration: 0.3 }
    : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="hero"
        className="flex min-h-screen flex-col"
      >
        <div className="mx-auto grid w-full max-w-7xl flex-1 gap-12 px-4 py-28 sm:px-6 lg:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* Texto Hero */}
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-sm font-semibold tracking-[0.22em] uppercase text-accent">
                Flores Premium de Lima
              </p>
              <h1 className="text-5xl leading-none sm:text-6xl lg:text-7xl font-heading text-primary">
                {BUSINESS.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8">
                Arreglos florales diseñados con pasión y flores frescas del más
                alto calibre. Más de {BUSINESS.experience} años transformando momentos especiales
                en {BUSINESS.location}.
              </p>
            </div>

            <HeroButtons campaignMode={CAMPAIGN_MODE} />
          </div>

          {/* Carrusel */}
          <div
            className="relative overflow-hidden rounded-3xl h-64 sm:h-80 lg:h-[440px]"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Galería de arreglos florales"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Badge: Certificado de frescura */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-sm" style={{ backgroundColor: "color-mix(in srgb, var(--color-white) 95%, transparent)" }}>
              <span
                className="h-2 w-2 rounded-full animate-pulse motion-reduce:animate-none"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--color-dark)" }}
              >
                Certificadas Frescas
              </span>
            </div>

            {/* Slides con AnimatePresence */}
            <div aria-live="polite" aria-atomic="true" className="absolute inset-0">
            <AnimatePresence initial={false} custom={direction}>
              <m.div
                key={page}
                custom={direction}
                variants={activeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={activeTransition}
                className="absolute inset-0"
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${slideIndex + 1} de ${slides.length}: ${currentSlide.label}`}
              >
                {hasImage ? (
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.label}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: currentSlide.bgColor }}
                  >
                    <div className="text-center text-white/80">
                      <div className="text-sm font-medium">
                        Cargando imagen...
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay degradado: optimizado para legibilidad */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--color-dark) 50%, transparent) 0%, color-mix(in srgb, var(--color-dark) 25%, transparent) 40%, transparent 70%)",
                  }}
                />

                {/* Texto del slide */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <m.p
                    initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2, duration: 0.4 }}
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {currentSlide.label}
                  </m.p>
                  <m.p
                    initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3, duration: 0.4 }}
                    className="text-sm opacity-90"
                  >
                    {currentSlide.sublabel}
                  </m.p>
                </div>
              </m.div>
            </AnimatePresence>
            </div>

            {/* Flechas de navegación */}
            <button
              onClick={() => paginate(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-white) 90%, transparent)", color: "var(--color-dark)" }}
              aria-label="Slide anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-white) 90%, transparent)", color: "var(--color-dark)" }}
              aria-label="Siguiente slide"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Mobile: Swipe hint */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center sm:hidden z-10">
              <span className="text-xs text-white/60 font-medium">
                Desliza para ver más
              </span>
            </div>

            {/* Dots indicadores */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className="h-2 cursor-pointer rounded-full transition-all duration-300"
                  style={{
                    width: index === slideIndex ? "24px" : "8px",
                    backgroundColor:
                      index === slideIndex ? "var(--color-white)" : "color-mix(in srgb, var(--color-white) 50%, transparent)",
                  }}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        <TrustBar />
      </section>
    </LazyMotion>
  );
}
