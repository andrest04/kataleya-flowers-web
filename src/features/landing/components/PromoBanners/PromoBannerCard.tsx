import Image from 'next/image';

import Button from '@/components/ui/Button';

interface PromoBannerCardProps {
  readonly imageSrc: string;
  readonly heading: string;
  readonly description: string;
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
  cta,
}: PromoBannerCardProps) {
  return (
    <div className="group relative isolate flex aspect-[4/5] items-end overflow-hidden rounded-2xl sm:aspect-[16/10]">
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="(max-width: 1023px) 100vw, 50vw"
        className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--color-dark) 70%, transparent) 0%, color-mix(in srgb, var(--color-dark) 20%, transparent) 55%, transparent 80%)',
        }}
      />
      <div className="relative space-y-3 p-6 sm:p-8">
        <h3 className="font-heading text-2xl text-(--color-cream) sm:text-3xl">{heading}</h3>
        <p className="max-w-sm text-sm text-(--color-cream) opacity-90">{description}</p>
        <Button variant={cta.variant} size="md" href={cta.href} external={cta.external}>
          {cta.label}
        </Button>
      </div>
    </div>
  );
}
