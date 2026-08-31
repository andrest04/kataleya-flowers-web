import HeroButtons from '../HeroButtons';

interface HeroContentProps {
  ctaExternal: boolean;
  ctaHref: string;
  ctaLabel: string;
  kicker: string;
  title: string;
}

export default function HeroContent({
  ctaExternal,
  ctaHref,
  ctaLabel,
  kicker,
  title,
}: HeroContentProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end pb-10 sm:items-center sm:pb-0">
      <div className="w-full px-4 sm:px-10 lg:px-40">
        <div className="mx-auto max-w-xs space-y-3 text-center sm:mx-0 sm:max-w-md sm:space-y-5">
          <p className="flex items-center justify-center gap-3 font-heading text-base text-(--color-cream) italic sm:text-lg">
            <span
              className="h-px w-6 bg-(--color-cream)/70 sm:w-8"
              aria-hidden="true"
            />
            {kicker}
            <span
              className="h-px w-6 bg-(--color-cream)/70 sm:w-8"
              aria-hidden="true"
            />
          </p>
          <h1 className="font-heading text-3xl leading-[1.05] text-balance text-(--color-cream) uppercase sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="pointer-events-auto flex justify-center pt-2">
            <HeroButtons href={ctaHref} label={ctaLabel} external={ctaExternal} />
          </div>
        </div>
      </div>
    </div>
  );
}
