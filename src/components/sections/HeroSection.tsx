"use client";

import { useState, useEffect, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import HeroButtons from "./HeroButtons";

// Campaign mode: 'contact' prioritizes contacting, 'catalog' prioritizes browsing
type CampaignMode = "contact" | "catalog";
const CAMPAIGN_MODE: CampaignMode = "contact";
const AUTOPLAY_INTERVAL = 4000; // milliseconds

const slides = [
  {
    id: 1,
    image: "/hero-1.jpg",
    bgColor: "var(--color-primary)",
    label: "Arreglos Hoy",
    sublabel: "Diseño personalizado, entrega rápida en Lima",
  },
  {
    id: 2,
    image: "/hero-2.jpg",
    bgColor: "var(--color-accent)",
    label: "Orquídeas Seleccionadas",
    sublabel: "Las variedades más finas, disponibles ahora",
  },
  {
    id: 3,
    image: "/hero-3.jpg",
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

  // Auto-play every AUTOPLAY_INTERVAL milliseconds
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paginate]);

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

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="hero"
        className="flex min-h-screen items-center px-4 py-28 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* Texto Hero */}
          <div className="space-y-8">
            <div className="space-y-5">
              <p
                className="text-sm font-semibold tracking-[0.22em] uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                Flores Premium de Lima
              </p>
              <h1
                className="text-5xl leading-none sm:text-6xl lg:text-7xl"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Kataleya Flawers
              </h1>
              <p className="max-w-2xl text-lg leading-8">
                Arreglos florales diseñados con pasión y flores frescas del más
                alto calibre. Más de 30 años transformando momentos especiales
                en Lima.
              </p>
            </div>

            <HeroButtons campaignMode={CAMPAIGN_MODE} />
          </div>

          {/* Carrusel */}
          <div className="relative overflow-hidden rounded-3xl h-64 sm:h-80 lg:h-[440px]">
            {/* Badge: Certificado de frescura */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
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
            <AnimatePresence initial={false} custom={direction}>
              <m.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="absolute inset-0"
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
                      "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 40%, transparent 70%)",
                  }}
                />

                {/* Texto del slide */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <m.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {currentSlide.label}
                  </m.p>
                  <m.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-sm opacity-90"
                  >
                    {currentSlide.sublabel}
                  </m.p>
                </div>
              </m.div>
            </AnimatePresence>

            {/* Flechas de navegación */}
            <button
              onClick={() => paginate(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition-all hover:bg-white hover:scale-105"
              aria-label="Slide anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition-all hover:bg-white hover:scale-105"
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
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: index === slideIndex ? "24px" : "8px",
                    backgroundColor:
                      index === slideIndex ? "white" : "rgba(255,255,255,0.5)",
                  }}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
