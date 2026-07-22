import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface EditorialTileProps {
  readonly imageSrc: string;
  readonly Icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly external?: boolean;
}

export default function EditorialTile({
  imageSrc,
  Icon,
  title,
  description,
  href,
  external,
}: EditorialTileProps) {
  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-(--color-surface)">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 33vw"
          className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div className="pt-7 text-center">
        <div className="flex items-center justify-center gap-3">
          <Icon className="h-7 w-7 shrink-0 text-(--color-primary)" aria-hidden="true" />
          <h3 className="font-heading text-3xl text-(--color-dark)">{title}</h3>
        </div>
        <p className="mt-3 text-lg text-(--color-muted)">{description}</p>
      </div>
    </>
  );

  const className =
    'group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)';

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
