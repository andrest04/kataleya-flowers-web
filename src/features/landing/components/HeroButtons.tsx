"use client";

import Button from "@/components/ui/Button";
import { BUSINESS } from "@/lib/constants";

type CampaignMode = "contact" | "catalog";

interface HeroButtonsProps {
  campaignMode?: CampaignMode;
}

export default function HeroButtons({
  campaignMode = "contact",
}: HeroButtonsProps) {
  const isContact = campaignMode === "contact";

  return (
    <Button
      variant="ghost"
      href={isContact ? BUSINESS.whatsapp : "/catalogo"}
      external={isContact}
      className="rounded-none border-2 border-(--color-dark) bg-(--color-cream) px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-(--color-dark) uppercase transition-colors duration-300 hover:bg-(--color-dark) hover:text-(--color-cream)"
    >
      {isContact ? "Pedir por WhatsApp" : "Ver catálogo"}
    </Button>
  );
}
