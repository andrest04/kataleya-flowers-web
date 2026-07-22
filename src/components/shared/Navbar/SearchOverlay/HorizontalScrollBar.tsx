"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";

interface HorizontalScrollBarProps {
  scrollRef: RefObject<HTMLDivElement | null>;
}

interface Progress {
  thumbPercent: number;
  offsetPercent: number;
  visible: boolean;
}

const HIDDEN_PROGRESS: Progress = { thumbPercent: 100, offsetPercent: 0, visible: false };

export default function HorizontalScrollBar({ scrollRef }: HorizontalScrollBarProps) {
  const [progress, setProgress] = useState<Progress>(HIDDEN_PROGRESS);

  const updateProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) {
      setProgress(HIDDEN_PROGRESS);
      return;
    }
    const thumbPercent = (el.clientWidth / el.scrollWidth) * 100;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const offsetPercent = (el.scrollLeft / maxScroll) * (100 - thumbPercent);
    setProgress({ thumbPercent, offsetPercent, visible: true });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(updateProgress);
    el.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [scrollRef, updateProgress]);

  const handlePointerDown = (downEvent: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const track = downEvent.currentTarget.parentElement;
    if (!el || !track) return;

    downEvent.preventDefault();
    const trackWidth = track.clientWidth;
    const startX = downEvent.clientX;
    const startScrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaRatio = (moveEvent.clientX - startX) / trackWidth;
      el.scrollLeft = startScrollLeft + deltaRatio * el.scrollWidth;
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    if (maxScroll > 0) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };

  if (!progress.visible) return null;

  return (
    <div className="mx-auto mt-6 h-1.5 w-64 rounded-full bg-(--color-border) sm:w-80">
      <div
        onPointerDown={handlePointerDown}
        className="h-1.5 cursor-grab rounded-full bg-(--color-primary) active:cursor-grabbing"
        style={{
          width: `${progress.thumbPercent}%`,
          marginLeft: `${progress.offsetPercent}%`,
        }}
      />
    </div>
  );
}
