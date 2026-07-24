"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";

interface HorizontalScrollBarProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  size?: "default" | "large";
  alwaysVisible?: boolean;
}

interface Progress {
  thumbPercent: number;
  offsetPercent: number;
  visible: boolean;
}

const HIDDEN_PROGRESS: Progress = { thumbPercent: 100, offsetPercent: 0, visible: false };

export default function HorizontalScrollBar({
  scrollRef,
  size = "default",
  alwaysVisible = false,
}: HorizontalScrollBarProps) {
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

    let frameId: number | undefined;
    const scheduleUpdate = () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = undefined;
        updateProgress();
      });
    };
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    const observeLayout = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(el);
      Array.from(el.children).forEach((child) => resizeObserver.observe(child));
    };
    const mutationObserver = new MutationObserver(() => {
      observeLayout();
      scheduleUpdate();
    });

    observeLayout();
    scheduleUpdate();
    el.addEventListener("scroll", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    mutationObserver.observe(el, { childList: true });

    return () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
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
      el.scrollLeft = startScrollLeft + deltaRatio * maxScroll;
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

  if (!progress.visible && !alwaysVisible) return null;

  const isLarge = size === "large";

  return (
    <div
      className={`mx-auto mt-6 rounded-full bg-(--color-border) ${
        isLarge ? "h-2" : "h-1.5 w-64 sm:w-80"
      }`}
      style={isLarge ? { width: "min(32rem, calc(100vw - 2rem))" } : undefined}
    >
      <div
        onPointerDown={handlePointerDown}
        className={`${isLarge ? "h-2" : "h-1.5"} cursor-grab rounded-full bg-(--color-primary) active:cursor-grabbing`}
        style={{
          width: `${progress.thumbPercent}%`,
          marginLeft: `${progress.offsetPercent}%`,
        }}
      />
    </div>
  );
}
