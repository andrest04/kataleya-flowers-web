import { BUSINESS } from '@/lib/constants';

export default function ContactMap() {
  return (
    <div
      className="relative aspect-4/3 w-full overflow-hidden rounded-md outline outline-1 -outline-offset-1 outline-black/10 lg:aspect-auto lg:h-full lg:min-h-100"
      style={{ background: 'var(--color-surface)' }}
    >
      <iframe
        src={BUSINESS.mapsEmbedUrl}
        title={`Ubicación de ${BUSINESS.name} en ${BUSINESS.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
