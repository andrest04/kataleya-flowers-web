"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AUTOPLAY_INTERVAL, SWIPE_THRESHOLD } from "./constants";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface UseHeroCarouselArgs {
  readonly slidesCount: number;
}

interface UseHeroCarouselResult {
  readonly page: number;
  readonly direction: number;
  readonly slideIndex: number;
  readonly prefersReducedMotion: boolean;
  readonly paginate: (newDirection: number) => void;
  readonly goToSlide: (index: number) => void;
  readonly handleTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
  readonly handleTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
}

/**
 * Lógica del carousel: paginación, autoplay, swipe táctil, reduced-motion.
 * `paginate` y `goToSlide` usan functional setState para que el autoplay
 * NO reinstale el `setInterval` en cada cambio de página.
 */
export function useHeroCarousel({
  slidesCount,
}: UseHeroCarouselArgs): UseHeroCarouselResult {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const slideIndex = ((page % slidesCount) + slidesCount) % slidesCount;

  const paginate = useCallback((newDirection: number) => {
    setPage(([currentPage]) => [currentPage + newDirection, newDirection]);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setPage(([currentPage]) => {
      const currentIndex = ((currentPage % slidesCount) + slidesCount) % slidesCount;
      return [index, index > currentIndex ? 1 : -1];
    });
  }, [slidesCount]);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - event.changedTouches[0].clientX;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD) paginate(1);
    else if (delta < -SWIPE_THRESHOLD) paginate(-1);
  }, [paginate]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => { paginate(1); }, AUTOPLAY_INTERVAL);
    return () => { window.clearInterval(timer); };
  }, [paginate, prefersReducedMotion]);

  return {
    page,
    direction,
    slideIndex,
    prefersReducedMotion,
    paginate,
    goToSlide,
    handleTouchStart,
    handleTouchEnd,
  };
}
