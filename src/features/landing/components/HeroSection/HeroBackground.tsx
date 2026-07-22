import Image from "next/image";
import type { CSSProperties } from "react";

import { HERO_IMAGE } from "./constants";

const SCRIM =
  "linear-gradient(to right, color-mix(in srgb, var(--color-dark) 55%, transparent) 0%, color-mix(in srgb, var(--color-dark) 18%, transparent) 45%, transparent 70%)";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[var(--hero-focus)] sm:object-center"
        style={{ "--hero-focus": HERO_IMAGE.focus } as CSSProperties}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: SCRIM }}
      />
    </div>
  );
}
