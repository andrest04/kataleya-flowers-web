'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { SiteSettings } from '@/lib/siteSettings';

import { mapsDirectionsHref } from './mapsDirectionsHref';

interface ContactMapProps {
  settings: SiteSettings;
}

const LOAD_TIMEOUT_MS = 10000;

export default function ContactMap({ settings }: ContactMapProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      timer = window.setTimeout(() => {
        setStatus((current) => (current === 'loaded' ? current : 'failed'));
      }, LOAD_TIMEOUT_MS);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-(--color-surface) outline outline-1 -outline-offset-1 outline-black/10 lg:aspect-auto lg:h-full lg:min-h-100"
      aria-busy={status === 'loading'}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span
          className="flex size-14 items-center justify-center rounded-full border border-(--color-primary)/25"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-cream))' }}
        >
          <MapPin
            className={`size-6 text-(--color-primary) ${status === 'loading' ? 'motion-safe:animate-pulse' : ''}`}
            aria-hidden="true"
            strokeWidth={1.6}
          />
        </span>
        <p className="font-heading text-lg text-(--color-dark)">
          {status === 'failed' ? 'No pudimos cargar el mapa' : 'Cargando mapa…'}
        </p>
        <p className="max-w-64 text-sm text-balance text-(--color-muted)">{settings.address}</p>
        <a
          href={mapsDirectionsHref(settings.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-full border border-(--color-primary) px-5 text-sm font-semibold text-(--color-primary) transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          Cómo llegar
        </a>
      </div>
      <iframe
        src={settings.mapsEmbedUrl}
        title={`Ubicación de ${settings.name} en ${settings.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-popups"
        allowFullScreen
        onLoad={() => setStatus('loaded')}
        className={`absolute inset-0 size-full border-0 transition-opacity duration-500 motion-reduce:transition-none ${status === 'loaded' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
    </div>
  );
}
