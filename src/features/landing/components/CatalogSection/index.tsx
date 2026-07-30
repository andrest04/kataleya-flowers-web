'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import HorizontalScrollBar from '@/components/shared/Navbar/SearchOverlay/HorizontalScrollBar';
import type { Category } from '@/features/catalog/types';

import CategoryTile from './CategoryTile';

interface CatalogSectionProps {
  categories: Category[];
}

export default function CatalogSection({ categories }: CatalogSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselId = useId();
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const featured = categories.filter((category) => category.isFeatured);
  const rest = categories.filter((category) => !category.isFeatured);
  const tiles = [...featured, ...rest];

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
  }, [tiles.length, updateScrollControls]);

  if (tiles.length === 0) {
    return null;
  }

  function scrollCarousel(direction: number) {
    const carousel = carouselRef.current;

    if (!carousel) return;

    carousel.scrollBy({
      left: direction * Math.max(carousel.clientWidth * 0.8, 240),
      behavior: 'smooth',
    });
  }

  return (
    <section id="catalogo" className="scroll-mt-20 overflow-x-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl leading-tight text-balance text-(--color-primary) sm:text-4xl lg:text-5xl">
          Flores y regalos para cada ocasión
        </h2>
      </div>

      <div
        className="relative left-1/2 mt-7 w-screen -translate-x-1/2 sm:mt-8"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onFocusCapture={() => setShowControls(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setShowControls(false);
          }
        }}
      >
        <div
          ref={carouselRef}
          id={carouselId}
          className="scrollbar-hide mx-auto flex max-w-[110rem] gap-4 overflow-x-auto px-4 pb-6 sm:gap-5 sm:px-6 sm:pb-7 lg:px-8"
          role="region"
          aria-label="Catálogos de flores por ocasión"
          onScroll={updateScrollControls}
        >
          {tiles.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              layoutClasses="w-[73vw] shrink-0 snap-start sm:w-[44vw] lg:w-[20rem]"
            />
          ))}
        </div>

        <HorizontalScrollBar scrollRef={carouselRef} size="large" alwaysVisible />

        {canScrollPrevious && (
          <button
            type="button"
            aria-controls={carouselId}
            aria-label="Ver categorías anteriores"
            onClick={() => scrollCarousel(-1)}
            className={`absolute top-1/2 left-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-primary) bg-(--color-cream) text-(--color-primary) shadow-sm transition-[background-color,opacity] duration-300 ease-out hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {canScrollNext && (
          <button
            type="button"
            aria-controls={carouselId}
            aria-label="Ver más categorías"
            onClick={() => scrollCarousel(1)}
            className={`absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-primary) bg-(--color-cream) text-(--color-primary) shadow-sm transition-[background-color,opacity] duration-300 ease-out hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
