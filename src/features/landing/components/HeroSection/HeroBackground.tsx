import type { CSSProperties } from 'react';
import { preconnect } from 'react-dom';

import Image from '@/components/ui/AppwriteImage';

import { HERO_IMAGE_CLASS, HERO_SCRIM } from './frame';

interface HeroBackgroundProps {
  alt: string;
  focus: string;
  src: string;
}

export default function HeroBackground({ alt, focus, src }: HeroBackgroundProps) {
  if (URL.canParse(src)) {
    preconnect(new URL(src).origin);
  }

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        className={HERO_IMAGE_CLASS}
        style={{ '--hero-focus': focus } as CSSProperties}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: HERO_SCRIM }}
      />
    </div>
  );
}
