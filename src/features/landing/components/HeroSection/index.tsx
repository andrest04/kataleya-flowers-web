import { getPublishedHeroSlide } from '@/features/landing/queries/getPublishedHeroSlide';
import { heroPositioningKicker } from '@/features/landing/rules/heroPositioning';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';

import { HERO_MIN_HEIGHT_PX } from './frame';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import { resolveHeroHref } from './resolveHeroHref';

export default async function HeroSection() {
  const [slide, settings] = await Promise.all([getPublishedHeroSlide(), getSiteSettings()]);

  if (!slide) {
    return (
      <section id="hero" className="scroll-mt-20">
        <h1 className="sr-only">{`${settings.name} — Floristería en ${settings.location}`}</h1>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="relative isolate"
      style={{ minHeight: HERO_MIN_HEIGHT_PX }}
    >
      <HeroBackground alt={slide.imageAlt} focus={slide.focus} src={slide.imageSrc} />
      <HeroContent
        ctaExternal={slide.ctaExternal}
        ctaHref={resolveHeroHref(slide.ctaHref, settings)}
        ctaLabel={slide.ctaLabel}
        kicker={heroPositioningKicker(settings)}
        title={slide.title}
      />
    </section>
  );
}
