import type { CSSProperties } from 'react';

import Image from '@/components/ui/AppwriteImage';
import {
  HERO_IMAGE_CLASS,
  HERO_MIN_HEIGHT_PX,
  HERO_SCRIM,
} from '@/features/landing/components/HeroSection/frame';

import type { HeroDraft } from './types';

const fieldRing =
  'border-0 p-0 rounded-sm bg-transparent text-center text-(--color-cream) outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-cream)';

interface CanvasProps {
  draft: HeroDraft;
  onChange: (patch: Partial<HeroDraft>) => void;
}

export default function Canvas({ draft, onChange }: CanvasProps) {
  return (
    <div className="relative isolate overflow-hidden" style={{ height: HERO_MIN_HEIGHT_PX }}>
      {draft.imageUrl ? (
        <Image
          src={draft.imageUrl}
          alt={draft.altText || 'Vista previa del hero'}
          fill
          priority
          sizes="100vw"
          className={HERO_IMAGE_CLASS}
          style={{ '--hero-focus': draft.focus } as CSSProperties}
        />
      ) : (
        <div className="absolute inset-0 bg-(--color-surface)" />
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: HERO_SCRIM }} />

      <div className="pointer-events-none absolute inset-0 flex items-end pb-10 sm:items-center sm:pb-0">
        <div className="w-full px-4 sm:px-10 lg:px-40">
          <div className="mx-auto max-w-xs space-y-3 text-center sm:mx-0 sm:max-w-md sm:space-y-5">
            <div className="pointer-events-auto flex items-center justify-center gap-3">
              <span className="h-px w-6 bg-(--color-cream)/70 sm:w-8" aria-hidden="true" />
              <label className="sr-only" htmlFor="hero-kicker">Línea chica sobre el título</label>
              <input
                id="hero-kicker"
                value={draft.kicker}
                onChange={(event) => onChange({ kicker: event.target.value })}
                className={`${fieldRing} min-w-0 flex-1 font-heading text-base italic sm:text-lg`}
              />
              <span className="h-px w-6 bg-(--color-cream)/70 sm:w-8" aria-hidden="true" />
            </div>
            <label className="sr-only" htmlFor="hero-title">Título del hero</label>
            <textarea
              id="hero-title"
              rows={2}
              value={draft.title}
              onChange={(event) => onChange({ title: event.target.value })}
              className={`pointer-events-auto ${fieldRing} w-full resize-none overflow-hidden field-sizing-content font-heading text-3xl leading-[1.05] text-balance uppercase sm:text-5xl lg:text-6xl`}
            />
            <p className="inline-block rounded-none border-2 border-(--color-dark) bg-(--color-cream) px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-(--color-dark) uppercase">
              {draft.ctaLabel || (draft.ctaType === 'catalogo' ? 'Ver catálogo' : 'Pedir por WhatsApp')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
