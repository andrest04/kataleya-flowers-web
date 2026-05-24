/**
 * Decoración editorial del Hero. Server Component, puro SVG + CSS.
 *
 * Compone dos capas detrás del contenido:
 *  1. Palabra "Flores" gigante en outline dorado (estilo editorial).
 *  2. Ramas botánicas line-art en las esquinas (esquinas vacías que
 *     marcamos en el audit visual).
 *
 * Es `aria-hidden` y `pointer-events-none` — pura decoración.
 * Se oculta en mobile (< lg) para no competir con el contenido.
 */
export default function HeroDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      <span
        className="font-heading absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(10rem,20vw,22rem)] leading-none font-bold tracking-tight whitespace-nowrap select-none"
        style={{
          WebkitTextStroke: "1.5px var(--color-secondary)",
          color: "transparent",
          opacity: 0.14,
        }}
      >
        Flores
      </span>

      <svg
        viewBox="0 0 220 360"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-secondary absolute -top-6 -left-6 h-[clamp(180px,22vw,340px)] w-auto opacity-60"
      >
        <path d="M30 0 C 60 80, 70 160, 60 240 S 80 330, 110 360" />
        <path d="M55 60 C 30 55, 10 70, 5 95 C 30 95, 50 85, 60 70 Z" />
        <path d="M68 120 C 95 110, 120 120, 130 145 C 105 150, 80 145, 67 130 Z" />
        <path d="M58 190 C 30 195, 12 215, 12 245 C 38 240, 58 220, 65 200 Z" />
        <path d="M70 250 C 100 245, 125 260, 135 285 C 110 290, 85 280, 72 262 Z" />
        <circle cx="138" cy="148" r="3" fill="currentColor" />
        <circle cx="138" cy="288" r="3" fill="currentColor" />
      </svg>

      <svg
        viewBox="0 0 220 360"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent absolute -right-8 -bottom-10 h-[clamp(200px,24vw,380px)] w-auto opacity-50"
      >
        <path d="M190 360 C 160 280, 150 200, 160 120 S 140 30, 110 0" />
        <path d="M165 300 C 195 305, 215 290, 220 265 C 195 265, 175 275, 165 290 Z" />
        <path d="M152 240 C 125 250, 100 240, 90 215 C 115 210, 140 215, 153 230 Z" />
        <path d="M162 170 C 190 165, 208 145, 208 115 C 182 120, 162 140, 155 160 Z" />
        <path d="M150 110 C 120 115, 95 100, 85 75 C 110 70, 135 80, 148 98 Z" />
        <circle cx="82" cy="215" r="2.5" fill="currentColor" />
        <circle cx="82" cy="75" r="2.5" fill="currentColor" />
      </svg>

      <svg
        viewBox="0 0 120 180"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-secondary absolute top-24 right-12 h-[clamp(80px,10vw,140px)] w-auto opacity-40"
      >
        <path d="M60 0 Q 50 60 60 120 T 60 180" />
        <path d="M58 30 Q 35 28 25 45 Q 45 50 60 42 Z" />
        <path d="M62 90 Q 88 88 98 105 Q 78 110 62 102 Z" />
        <path d="M58 150 Q 35 148 25 165 Q 45 170 60 162 Z" />
      </svg>
    </div>
  );
}
