import { MapPin } from 'lucide-react';

import type { SiteSettings } from '@/lib/siteSettings';

interface ContactMapProps {
  settings: SiteSettings;
}

export default function ContactMap({ settings }: ContactMapProps) {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-(--color-surface) outline outline-1 -outline-offset-1 outline-black/10 lg:aspect-auto lg:h-full lg:min-h-100">
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
        aria-hidden="true"
      >
        <span
          className="flex size-14 items-center justify-center rounded-full border border-(--color-primary)/25"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-cream))' }}
        >
          <MapPin className="size-6 text-(--color-primary) motion-safe:animate-pulse" strokeWidth={1.6} />
        </span>
        <p className="font-heading text-lg text-(--color-dark)">Cargando mapa…</p>
      </div>
      <iframe
        src={settings.mapsEmbedUrl}
        title={`Ubicación de ${settings.name} en ${settings.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-popups"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
