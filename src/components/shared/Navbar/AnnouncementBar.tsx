import Link from 'next/link';

import { whatsappWithMessage } from '@/lib/contactLinks';
import type { VisibleAnnouncement } from '@/lib/siteSettings';

interface AnnouncementBarProps {
  announcement: VisibleAnnouncement | null;
  phone: string;
  whatsappDefault: string;
}

export default function AnnouncementBar({
  announcement,
  phone,
  whatsappDefault,
}: AnnouncementBarProps) {
  if (!announcement) return null;

  if (announcement.kind === 'fallback') {
    const href = whatsappWithMessage(phone, whatsappDefault);
    return (
      <div className="flex h-10 items-center justify-center bg-(--color-primary) px-4 text-center">
        <p className="truncate font-body text-xs tracking-[0.01em] text-(--color-cream) sm:text-sm">
          <span className="hidden sm:inline">Flores frescas para cada ocasión. </span>
          <span className="sm:hidden">Flores frescas. </span>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer font-semibold underline underline-offset-2"
          >
            Pedir por WhatsApp
          </a>
        </p>
      </div>
    );
  }

  const ctaClassName = 'cursor-pointer font-semibold underline underline-offset-2';
  const isExternal = announcement.ctaHref.startsWith('http');

  return (
    <div className="flex h-10 items-center justify-center bg-(--color-primary) px-4 text-center">
      <p className="truncate font-body text-xs tracking-[0.01em] text-(--color-cream) sm:text-sm">
        {announcement.text}{' '}
        {isExternal ? (
          <a
            href={announcement.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClassName}
          >
            {announcement.ctaLabel}
          </a>
        ) : (
          <Link href={announcement.ctaHref} className={ctaClassName}>
            {announcement.ctaLabel}
          </Link>
        )}
      </p>
    </div>
  );
}
