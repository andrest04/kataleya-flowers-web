"use client";

import Link from "next/link";

interface HeroButtonsProps {
  primaryTarget: string;
  secondaryTarget: string;
}

export default function HeroButtons({
  secondaryTarget,
}: HeroButtonsProps) {
  const handleScroll = (targetId: string) => {
    // Extraer el ID si viene con # (ej: "#contacto" -> "contacto")
    const cleanId = targetId.startsWith("#") ? targetId.slice(1) : targetId;
    const target = document.getElementById(cleanId);

    if (!target) {
      console.warn(`[HeroButtons] Target element with id "${cleanId}" not found`);
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Link
        href="/catalogo"
        className="rounded-full px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-90 text-center"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-cream)",
        }}
      >
        Ver catálogo
      </Link>
      <button
        type="button"
        className="rounded-full border px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-80"
        style={{
          borderColor: "var(--color-accent)",
          color: "var(--color-accent)",
        }}
        onClick={() => handleScroll(secondaryTarget)}
      >
        Contáctanos
      </button>
    </div>
  );
}
