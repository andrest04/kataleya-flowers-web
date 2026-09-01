import { Mail, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';

import type { SiteSettings } from '@/lib/siteSettings';

const CARD_CLASS =
  'group flex flex-col items-center gap-1 text-center transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4';

interface OtherContactMethodsProps {
  settings: SiteSettings;
}

export default function OtherContactMethods({ settings }: OtherContactMethodsProps) {
  const channels = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: `+${settings.phone}`,
      href: settings.whatsapp,
      external: true,
    },
    {
      icon: Mail,
      label: 'Correo',
      value: settings.email,
      href: `mailto:${settings.email}`,
      external: true,
    },
    {
      icon: MapPin,
      label: 'Tienda',
      value: settings.address,
      href: '/#contacto',
      external: false,
    },
  ] as const;

  return (
    <section aria-labelledby="other-contact" className="mt-16 border-t border-(--color-border) pt-10">
      <h2 id="other-contact" className="font-heading text-xl text-primary">
        Otros medios de contacto
      </h2>
      <p className="mt-1 text-sm text-(--color-dark) opacity-80">
        Si lo prefieres, también puedes escribirnos por estos canales.
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-3 sm:gap-4 sm:divide-x sm:divide-(--color-border)">
        {channels.map(({ icon: Icon, label, value, href, external }) => {
          const inner = (
            <>
              <Icon
                size={28}
                strokeWidth={1}
                aria-hidden="true"
                className="text-(--color-accent) transition-transform duration-200 group-hover:scale-110"
              />
              <span className="mt-2 block text-sm font-semibold text-(--color-dark)">{label}</span>
              <span className="block text-sm break-words text-(--color-dark) opacity-70">
                {value}
              </span>
            </>
          );

          const style = { outlineColor: 'var(--color-secondary)' };

          return external ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={CARD_CLASS}
              style={style}
            >
              {inner}
            </a>
          ) : (
            <Link key={label} href={href} className={CARD_CLASS} style={style}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
