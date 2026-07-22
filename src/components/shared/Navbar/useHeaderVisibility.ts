"use client";

import { useEffect, useRef, useState } from "react";

const DIRECTION_CHANGE_THRESHOLD = 12;

export function useHeaderVisibility(threshold = 180, isLocked = false): boolean {
  const [isHidden, setIsHidden] = useState(false);
  const lastDirection = useRef<"down" | "up" | null>(null);
  const lastScrollY = useRef(0);
  const directionalDistance = useRef(0);

  useEffect(() => {
    const showHeader = () => {
      setIsHidden((wasHidden) => (wasHidden ? false : wasHidden));
    };

    const resetDirection = () => {
      lastDirection.current = null;
      directionalDistance.current = 0;
    };

    lastScrollY.current = window.scrollY;

    if (isLocked) {
      showHeader();
      resetDirection();
      return;
    }

    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (currentScrollY <= threshold) {
        showHeader();
        resetDirection();
        return;
      }

      if (scrollDelta === 0) return;

      const direction = scrollDelta > 0 ? "down" : "up";

      if (lastDirection.current !== direction) {
        lastDirection.current = direction;
        directionalDistance.current = 0;
      }

      directionalDistance.current += Math.abs(scrollDelta);

      if (directionalDistance.current < DIRECTION_CHANGE_THRESHOLD) return;

      setIsHidden((wasHidden) => (wasHidden === (direction === "down") ? wasHidden : direction === "down"));
      directionalDistance.current = 0;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLocked, threshold]);

  return isHidden;
}
