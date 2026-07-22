import { CAMPAIGN_MODE } from "./constants";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";

/**
 * Hero principal de la landing, full-bleed: la fotografía floral ES el diseño.
 * Server Component que compone dos capas (pintadas por orden del DOM, sin
 * z-index arbitrarios):
 *  - HeroBackground (client): carousel de fotos a pantalla completa + scrims.
 *  - HeroContent (server): kicker + H1 + subtítulo + CTAs, superpuestos.
 *
 * Para cambiar el CTA primario editar `CAMPAIGN_MODE` en `./constants.ts`.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <HeroBackground />
      <HeroContent campaignMode={CAMPAIGN_MODE} />
    </section>
  );
}
