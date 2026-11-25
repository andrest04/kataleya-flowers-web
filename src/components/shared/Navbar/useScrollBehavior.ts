"use client";

import { useEffect, useState } from "react";

export function useScrollBehavior(threshold = 180, hideDelay = 500): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {
      const isPastThreshold = window.scrollY > threshold;

      if (!isPastThreshold) {
        clearTimeout(hideTimeout);
        hideTimeout = undefined;
        setIsScrolled(false);
        return;
      }

      if (hideTimeout !== undefined) return;
      hideTimeout = setTimeout(() => {
        setIsScrolled(true);
        hideTimeout = undefined;
      }, hideDelay);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(hideTimeout);
    };
  }, [threshold, hideDelay]);

  return isScrolled;
}
