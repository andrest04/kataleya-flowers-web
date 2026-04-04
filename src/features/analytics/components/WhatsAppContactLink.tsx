'use client';

import type { ReactNode } from 'react';
import { clientTrackEvent } from '@/features/analytics/lib/clientTrack';

interface WhatsAppContactLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export default function WhatsAppContactLink({
  href,
  className,
  style,
  children,
}: WhatsAppContactLinkProps) {
  const handleClick = () => {
    clientTrackEvent({
      eventType: 'whatsapp_click',
      metadata: { source: 'contact' },
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
