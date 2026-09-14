'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import HorizontalScrollBar from '@/components/shared/Navbar/SearchOverlay/HorizontalScrollBar';

interface CarouselProps {
  children: React.ReactNode;
  ariaLabel: string;
  leftInsetClassName?: string;
  /** Escape a parent's own horizontal padding via 100vw. Skip when the parent is already unpadded — vw always includes the scrollbar, which offsets the breakout by its width. */
  fullBleed?: boolean;
}

const DEFAULT_LEFT_INSET = 'pl-8 scroll-pl-8 sm:pl-12 sm:scroll-pl-12 lg:pl-16 lg:scroll-pl-16';

export default function Carousel({
  children,
  ariaLabel,
  leftInsetClassName,
  fullBleed = true,
}: CarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselId = useId();
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const updateScrollControls = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    setCanScrollPrevious(carousel.scrollLeft > 1);
    setCanScrollNext(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const resizeObserver = new ResizeObserver(updateScrollControls);

    resizeObserver.observe(carousel);
    updateScrollControls();

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateScrollControls]);

  function scrollCarousel(direction: number) {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    carousel.scrollBy({
      left: direction * Math.max(carousel.clientWidth * 0.8, 240),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  return (
    <div
      className={`relative mt-7 sm:mt-8 ${fullBleed ? 'w-screen mx-[calc(50%-50vw)]' : 'w-full'}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onFocusCapture={() => setShowControls(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setShowControls(false);
        }
      }}
    >
      <div className="relative">
        <div
          ref={carouselRef}
          id={carouselId}
          className={`scrollbar-hide flex snap-x snap-proximity gap-4 overflow-x-auto pr-8 pb-6 scroll-pr-8 sm:gap-5 sm:pr-12 sm:scroll-pr-12 sm:pb-7 lg:pr-16 lg:scroll-pr-16 ${leftInsetClassName ?? DEFAULT_LEFT_INSET}`}
          role="region"
          aria-label={ariaLabel}
          onScroll={updateScrollControls}
        >
          {children}
        </div>

        {canScrollPrevious && (
          <button
            type="button"
            aria-controls={carouselId}
            aria-label="Ver anteriores"
            onClick={() => scrollCarousel(-1)}
            className={`absolute top-[40%] left-16 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-primary) bg-(--color-cream) text-(--color-primary) shadow-sm transition-[background-color,opacity] duration-300 ease-out hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none sm:left-20 lg:left-32 ${showControls ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {canScrollNext && (
          <button
            type="button"
            aria-controls={carouselId}
            aria-label="Ver más"
            onClick={() => scrollCarousel(1)}
            className={`absolute top-[40%] right-16 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-primary) bg-(--color-cream) text-(--color-primary) shadow-sm transition-[background-color,opacity] duration-300 ease-out hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none sm:right-20 lg:right-32 ${showControls ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <HorizontalScrollBar scrollRef={carouselRef} size="large" alwaysVisible />
    </div>
  );
}
