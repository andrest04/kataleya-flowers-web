"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

interface UseAnchorNavigationOptions {
  isDrawerOpen: boolean;
  closeDrawer: () => void;
}

export function useAnchorNavigation({
  isDrawerOpen,
  closeDrawer,
}: UseAnchorNavigationOptions) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return useCallback(
    (href: string) => {
      const targetId = href.startsWith("#")
        ? href.slice(1)
        : href.split("#")[1];

      if (!targetId) {
        closeDrawer();
        return;
      }

      if (!isLandingPage) {
        closeDrawer();
        window.location.href = `/#${targetId}`;
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) {
        console.warn(`[Navbar] Target element with id "${targetId}" not found`);
        closeDrawer();
        return;
      }

      const scrollToTarget = () => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      if (isDrawerOpen) {
        closeDrawer();
        window.setTimeout(scrollToTarget, 320);
        return;
      }

      scrollToTarget();
    },
    [isDrawerOpen, isLandingPage, closeDrawer],
  );
}
