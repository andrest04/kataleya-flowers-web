import type { SiteSettings } from '@/lib/siteSettings';

interface ContactMapProps {
  settings: SiteSettings;
}

export default function ContactMap({ settings }: ContactMapProps) {
  return (
    <div
      className="relative aspect-4/3 w-full overflow-hidden rounded-md outline outline-1 -outline-offset-1 outline-black/10 lg:aspect-auto lg:h-full lg:min-h-100"
      style={{ background: 'var(--color-surface)' }}
    >
      <iframe
        src={settings.mapsEmbedUrl}
        title={`Ubicación de ${settings.name} en ${settings.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
