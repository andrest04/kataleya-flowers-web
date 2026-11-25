import { getPublishedHeroSlide } from '@/features/landing/queries/getPublishedHeroSlide';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';

import { HERO_MIN_HEIGHT_PX } from './frame';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';

export default async function HeroSection() {
  const slide = await getPublishedHeroSlide();

  if (!slide) {
    const settings = await getSiteSettings();
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
        ctaHref={slide.ctaHref}
        ctaLabel={slide.ctaLabel}
        kicker={slide.kicker}
        title={slide.title}
      />
    </section>
  );
}
