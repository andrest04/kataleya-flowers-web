import { getPublishedHeroSlide } from '@/features/landing/queries/getPublishedHeroSlide';

import { HERO_MIN_HEIGHT_PX } from './frame';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';

export default async function HeroSection() {
  const slide = await getPublishedHeroSlide();

  if (!slide) {
    return <section id="hero" className="scroll-mt-20" />;
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
