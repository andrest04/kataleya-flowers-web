"use client";

import type { MouseEvent, ReactNode } from "react";

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
  const targetId = href.startsWith("#") ? href.slice(1) : href.split("#")[1];
  const nativeHref = href.startsWith("#") ? `/${href}` : href;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (targetId && document.getElementById(targetId)) {
      event.preventDefault();
      handleNavigate(href);
    }
  };

  return (
    <a href={nativeHref} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
