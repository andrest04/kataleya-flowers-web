"use client";

import { BUSINESS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { clientTrackEvent } from "@/features/analytics/lib/clientTrack";

type CampaignMode = "contact" | "catalog";

interface HeroButtonsProps {
  campaignMode?: CampaignMode;
}

export default function HeroButtons({
  campaignMode = "contact",
}: HeroButtonsProps) {
  const handleScroll = (targetId: string) => {
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

  const isPrimaryContact = campaignMode === "contact";

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {isPrimaryContact ? (
        <>
          <Button
            variant="primary"
            size="lg"
            href={BUSINESS.whatsapp}
            external
            className="text-center"
            onClick={() => clientTrackEvent({ eventType: 'whatsapp_click', metadata: { source: 'hero' } })}
          >
            Pedir por WhatsApp
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="/catalogo"
            className="text-center"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
          >
            Explorar Catálogo
          </Button>
        </>
      ) : (
        <>
          <Button variant="primary" size="lg" href="/catalogo" className="text-center">
            Ver Catálogo
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleScroll("#contacto")}
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
          >
            Contáctanos
          </Button>
        </>
      )}
    </div>
  );
}
