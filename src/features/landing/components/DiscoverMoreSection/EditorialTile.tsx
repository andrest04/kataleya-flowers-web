import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';

import Image from '@/components/ui/AppwriteImage';

interface EditorialTileProps {
  readonly cover?: ReactNode;
  readonly description: string;
  readonly external?: boolean;
  readonly href: string;
  readonly Icon: LucideIcon;
  readonly imageSrc: string;
  readonly preview?: boolean;
  readonly title: string;
}

export default function EditorialTile({
  cover,
  description,
  external,
  href,
  Icon,
  imageSrc,
  preview = false,
  title,
}: EditorialTileProps) {
  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-(--color-surface) outline outline-1 -outline-offset-1 outline-black/10">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 1023px) 100vw, 33vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
          />
        ) : null}
        {cover}
      </div>
      <div className="pt-7 text-center">
        <div className="flex items-center justify-center gap-3">
          <Icon className="h-6 w-6 shrink-0 text-(--color-primary) sm:h-7 sm:w-7" aria-hidden="true" />
          <h3 className="font-heading text-2xl text-(--color-dark) lg:text-3xl">{title}</h3>
        </div>
        <p className="mt-3 text-base text-(--color-muted) lg:text-lg">{description}</p>
      </div>
    </>
  );

  const className =
    'group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)';

  if (preview) {
    return <div className={className}>{content}</div>;
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
