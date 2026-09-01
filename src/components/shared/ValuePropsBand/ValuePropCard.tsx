import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import FooterAnchorLink from '@/components/shared/FooterAnchorLink';

const LINK_CLASS =
  'font-body text-xs font-semibold tracking-[0.15em] uppercase underline underline-offset-4 transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)';

export interface ValueProp {
  Icon: LucideIcon;
  description: string;
  href: string;
  isAnchor?: boolean;
  isExternal?: boolean;
  linkLabel: string;
  preview?: boolean;
  title: string;
}

export default function ValuePropCard({
  Icon,
  description,
  href,
  isAnchor,
  isExternal,
  linkLabel,
  preview = false,
  title,
}: ValueProp) {
  const cta = preview ? (
    <span className={LINK_CLASS}>{linkLabel}</span>
  ) : isAnchor ? (
    <FooterAnchorLink href={href} className={LINK_CLASS}>
      {linkLabel}
    </FooterAnchorLink>
  ) : (
    <Link
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={LINK_CLASS}
    >
      {linkLabel}
      {isExternal ? <span className="sr-only"> (se abre en una pestaña nueva)</span> : null}
    </Link>
  );

  return (
    <div className="flex flex-col items-center gap-4 border-t border-(--color-primary) px-6 py-16 text-center first:border-t-0 md:border-t-0 md:border-l md:py-28 md:first:border-l-0">
      <Icon size={48} strokeWidth={1} aria-hidden="true" className="text-(--color-dark)" />

      <h2 className="font-heading text-2xl">{title}</h2>

      <p className="max-w-xs font-body text-sm leading-relaxed opacity-80">{description}</p>

      {cta}
    </div>
  );
}
