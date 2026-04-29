"use client";

import type { LucideIcon } from "lucide-react";

const ARROW_BG = {
  backgroundColor: "color-mix(in srgb, var(--color-white) 90%, transparent)",
  color: "var(--color-dark)",
};
const OVERLAY_Z = { zIndex: "var(--z-hero-overlay)" } as const;

interface HeroArrowButtonProps {
  readonly side: "left" | "right";
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
}

export default function HeroArrowButton({
  side,
  Icon,
  label,
  onClick,
}: HeroArrowButtonProps) {
  const position = side === "left" ? "left-3" : "right-3";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 ${position} flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-105`}
      style={{ ...ARROW_BG, ...OVERLAY_Z }}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
