"use client";

import Button from "@/components/ui/Button";
import { BUSINESS } from "@/lib/constants";

type CampaignMode = "contact" | "catalog";

interface HeroButtonsProps {
  campaignMode?: CampaignMode;
  /** Estilo para fondo oscuro (hero full-bleed sobre foto). */
  onDark?: boolean;
}

function handleScroll(targetId: string) {
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
}

export default function HeroButtons({
  campaignMode = "contact",
  onDark = false,
}: HeroButtonsProps) {
  const isPrimaryContact = campaignMode === "contact";

  // Secundario discreto: sobre la foto oscura, borde crema tenue + texto crema
  // (ghost), claramente subordinado al primario sólido. En claro, contorno verde.
  const secondaryStyle = onDark
    ? {
        borderColor: "color-mix(in srgb, var(--color-cream) 38%, transparent)",
        color: "var(--color-cream)",
      }
    : { borderColor: "var(--color-accent)", color: "var(--color-accent)" };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      {isPrimaryContact ? (
        <>
          <Button
            variant="primary"
            size="lg"
            href={BUSINESS.whatsapp}
            external
            className="w-full text-center sm:w-auto"
          >
            Pedir por WhatsApp
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="/catalogo"
            className="w-full text-center sm:w-auto"
            style={secondaryStyle}
          >
            Explorar Catálogo
          </Button>
        </>
      ) : (
        <>
          <Button variant="primary" size="lg" href="/catalogo" className="w-full text-center sm:w-auto">
            Ver Catálogo
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleScroll("#contacto")}
            className="w-full text-center sm:w-auto"
            style={secondaryStyle}
          >
            Contáctanos
          </Button>
        </>
      )}
    </div>
  );
}
