import Image from '@/components/ui/AppwriteImage';
import Button from '@/components/ui/Button';

interface PromoBannerCardProps {
  readonly imageSrc: string;
  readonly heading: string;
  readonly description: string;
  readonly contentPosition: 'top' | 'bottom';
  readonly cta: {
    readonly label: string;
    readonly href: string;
    readonly external?: boolean;
    readonly variant: 'primary' | 'whatsapp';
  };
}

export default function PromoBannerCard({
  imageSrc,
  heading,
  description,
  contentPosition,
  cta,
}: PromoBannerCardProps) {
  const isTop = contentPosition === 'top';

  return (
    <div
      className={`group relative isolate flex aspect-[3/4] overflow-hidden rounded-md outline outline-1 -outline-offset-1 outline-black/10 sm:aspect-[4/3] ${isTop ? 'items-start' : 'items-end'}`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-(--color-surface)" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: isTop
            ? 'linear-gradient(to bottom, color-mix(in srgb, var(--color-dark) 70%, transparent) 0%, color-mix(in srgb, var(--color-dark) 20%, transparent) 55%, transparent 80%)'
            : 'linear-gradient(to top, color-mix(in srgb, var(--color-dark) 70%, transparent) 0%, color-mix(in srgb, var(--color-dark) 20%, transparent) 55%, transparent 80%)',
        }}
      />
      <div
        className={`relative w-full space-y-3 p-6 sm:p-8 ${isTop ? 'flex flex-col items-center text-center' : ''}`}
      >
        <h3 className="font-heading text-2xl text-(--color-cream) sm:text-3xl">{heading}</h3>
        <p className="max-w-sm text-sm text-(--color-cream) opacity-90">{description}</p>
        <Button variant={cta.variant} size="md" href={cta.href} external={cta.external}>
          {cta.label}
        </Button>
      </div>
    </div>
  );
}
