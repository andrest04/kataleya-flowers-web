"use client";

import type { HeroSlide } from "./types";

interface HeroDotsProps {
  readonly slides: readonly HeroSlide[];
  readonly activeIndex: number;
  readonly onSelect: (index: number) => void;
}

export default function HeroDots({
  slides,
  activeIndex,
  onSelect,
}: HeroDotsProps) {
  return (
    <div
      className="absolute right-4 bottom-4 flex items-center gap-2"
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
            className="h-2 cursor-pointer rounded-full transition-all duration-300"
            style={{
              width: isActive ? "24px" : "8px",
              backgroundColor: isActive
                ? "var(--color-white)"
                : "color-mix(in srgb, var(--color-white) 50%, transparent)",
            }}
            aria-label={`Ir a slide ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
