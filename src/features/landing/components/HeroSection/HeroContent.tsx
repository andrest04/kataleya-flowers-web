import { BUSINESS } from "@/lib/constants";

import HeroButtons from "../HeroButtons";
import type { CampaignMode } from "./types";

interface HeroContentProps {
  readonly campaignMode: CampaignMode;
}

/**
 * Texto principal del Hero. Es Server Component — el texto es estático y
 * sirve para SEO/LCP sin hidratar JS. Sólo HeroButtons se hidrata como
 * client (necesita onClick para tracking).
 */
export default function HeroContent({ campaignMode }: HeroContentProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <p className="text-sm font-semibold tracking-[0.22em] text-accent uppercase">
          Flores Premium de Lima
        </p>
        <h1 className="font-heading text-primary text-5xl leading-none sm:text-6xl lg:text-7xl">
          {BUSINESS.name}
        </h1>
        <p className="max-w-2xl text-lg leading-8">
          Arreglos florales diseñados con pasión y flores frescas del más alto
          calibre. Más de {BUSINESS.experience} años transformando momentos
          especiales en {BUSINESS.location}.
        </p>
      </div>

      <HeroButtons campaignMode={campaignMode} />
    </div>
  );
}
