import { Mail, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';

import { BUSINESS } from '@/lib/constants';

const CARD_BORDER = 'color-mix(in srgb, var(--color-secondary) 40%, var(--color-border))';

const CARD_CLASS =
  'group flex items-start gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2';

const CHANNELS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: `+${BUSINESS.phone}`,
    href: BUSINESS.whatsapp,
    external: true,
  },
  {
    icon: Mail,
    label: 'Correo',
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
    external: true,
  },
  {
    icon: MapPin,
    label: 'Tienda',
    value: BUSINESS.address,
    href: '/#contacto',
    external: false,
  },
] as const;

export default function OtherContactMethods() {
  return (
    <section aria-labelledby="other-contact" className="mt-12">
      <h2 id="other-contact" className="font-heading text-xl text-primary">
        Otros medios de contacto
      </h2>
      <p className="mt-1 text-sm text-(--color-dark) opacity-80">
        Si lo prefieres, también puedes escribirnos por estos canales.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {CHANNELS.map(({ icon: Icon, label, value, href, external }) => {
          const inner = (
            <>
              <Icon
                size={20}
                aria-hidden="true"
                className="shrink-0 text-(--color-accent) transition-transform duration-200 group-hover:scale-110"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-(--color-dark)">{label}</span>
                <span className="block text-sm break-words text-(--color-dark) opacity-70">
                  {value}
                </span>
              </span>
            </>
          );

          const style = {
            borderColor: CARD_BORDER,
            background: 'var(--color-white)',
            outlineColor: 'var(--color-secondary)',
          };

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
