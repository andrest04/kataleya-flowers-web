"use client";

import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

type CampaignMode = "contact" | "catalog";

interface HeroButtonsProps {
  campaignMode?: CampaignMode;
}

export default function HeroButtons({
  campaignMode = "contact",
}: HeroButtonsProps) {
  const handleScroll = (targetId: string) => {
    // Extraer el ID si viene con # (ej: "#contacto" -> "contacto")
    const cleanId = targetId.startsWith("#") ? targetId.slice(1) : targetId;
    const target = document.getElementById(cleanId);

    if (!target) {
      console.warn(
        `[HeroButtons] Target element with id "${cleanId}" not found`,
      );
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Determine primary and secondary CTAs based on campaign mode
  const isPrimaryContact = campaignMode === "contact";

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {isPrimaryContact ? (
        // Primary: Contact
        <>
          <a
            href={BUSINESS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-90 text-center"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-cream)",
            }}
          >
            Pedir por WhatsApp
          </a>
          <Link
            href="/catalogo"
            className="rounded-full border px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-80 text-center"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
            }}
          >
            Explorar Catálogo
          </Link>
        </>
      ) : (
        // Primary: Catalog
        <>
          <Link
            href="/catalogo"
            className="rounded-full px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-90 text-center"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-cream)",
            }}
          >
            Ver Catálogo
          </Link>
          <button
            type="button"
            className="rounded-full border px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-80"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
            }}
            onClick={() => handleScroll("#contacto")}
          >
            Contáctanos
          </button>
        </>
      )}
    </div>
  );
}
