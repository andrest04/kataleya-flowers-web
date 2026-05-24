import TrustBar from "../TrustBar";
import { CAMPAIGN_MODE } from "./constants";
import HeroCarousel from "./HeroCarousel";
import HeroContent from "./HeroContent";
import HeroDecor from "./HeroDecor";

/**
 * Hero principal de la landing. Server Component que compone:
 *  - HeroContent (server, texto + h1 + CTA)
 *  - HeroCarousel (client, carousel con slides + autoplay + swipe)
 *  - TrustBar (client, métricas con animación de count-up)
 *
 * Para cambiar el CTA primario editar `CAMPAIGN_MODE` en `./constants.ts`.
 */
export default function HeroSection() {
  return (
    <section id="hero" className="relative flex min-h-screen flex-col overflow-hidden">
      <HeroDecor />
      <div className="relative mx-auto grid w-full max-w-7xl flex-1 gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <HeroContent campaignMode={CAMPAIGN_MODE} />
        <HeroCarousel />
      </div>
      <TrustBar />
    </section>
  );
}
