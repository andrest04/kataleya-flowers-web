import { BUSINESS } from "@/lib/constants";

import HeroButtons from "../HeroButtons";
import type { CampaignMode } from "./types";

interface HeroContentProps {
  readonly campaignMode: CampaignMode;
}

/**
 * Texto principal del Hero, superpuesto sobre la foto full-bleed.
 * Server Component: el H1 es estático y aporta SEO/LCP sin hidratar JS.
 * `pointer-events-none` deja pasar los clics al carousel de fondo (flechas,
 * dots, swipe); sólo los CTAs reactivan los eventos de puntero.
 */
export default function HeroContent({ campaignMode }: HeroContentProps) {
  return (
    <div className="pointer-events-none relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pt-28 pb-12 sm:px-6 sm:pt-32 lg:px-8 lg:pb-20">
      <div className="max-w-2xl space-y-6">
        {/* Cream over variable hero scrims: gold #e8b84b fails AA on the peonias
            slide at 390px. Cream is consistently safe on verified dark scrims. */}
        <p className="text-sm font-semibold tracking-[0.18em] text-(--color-cream) uppercase opacity-90">
          Florería premium en {BUSINESS.location}
        </p>
        <h1 className="font-heading text-5xl leading-[1.05] text-balance text-(--color-cream) sm:text-6xl lg:text-7xl">
          Flores que emocionan
        </h1>
        <p className="max-w-xl text-lg leading-8 text-(--color-cream)">
          Arreglos diseñados con flores frescas del más alto calibre. Más de{" "}
          {BUSINESS.experience} años creando momentos inolvidables en{" "}
          {BUSINESS.location}.
        </p>
        <div className="pointer-events-auto pt-2">
          <HeroButtons campaignMode={campaignMode} onDark />
        </div>
      </div>
    </div>
  );
}
