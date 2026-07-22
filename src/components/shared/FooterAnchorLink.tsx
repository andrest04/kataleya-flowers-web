"use client";

import type { ReactNode } from "react";

import { useAnchorNavigation } from "@/components/shared/Navbar/useAnchorNavigation";

interface FooterAnchorLinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export default function FooterAnchorLink({
  href,
  className,
  ariaLabel,
  children,
}: FooterAnchorLinkProps) {
  const handleNavigate = useAnchorNavigation();

  return (
    <button
      type="button"
      onClick={() => handleNavigate(href)}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
