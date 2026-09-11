import { Clock, Mail, MapPin } from 'lucide-react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

import BusinessHoursBadge from '@/components/shared/BusinessHoursBadge';
import Button from '@/components/ui/Button';
import { whatsappWithMessage } from '@/lib/contactLinks';
import type { SiteSettings } from '@/lib/siteSettings';

interface ContactDetailsProps {
  settings: SiteSettings;
}

export default function ContactDetails({ settings }: ContactDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex gap-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-(--color-primary)" aria-hidden="true" strokeWidth={1.8} />
          <dl>
            <dt className="text-sm font-semibold text-(--color-dark)">Dónde estamos</dt>
            <dd className="mt-1 text-(--color-dark)">{settings.address}</dd>
          </dl>
        </div>

        <div className="flex gap-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-(--color-primary)" aria-hidden="true" strokeWidth={1.8} />
          <dl>
            <dt className="flex flex-wrap items-center gap-2 text-sm font-semibold text-(--color-dark)">
              Horario de atención
              <BusinessHoursBadge hours={settings.hours} />
            </dt>
            <dd className="mt-1 text-(--color-dark)">
              {settings.hours.weekdays} · {settings.hours.time}
            </dd>
          </dl>
        </div>

        <div className="flex gap-4">
          <Mail className="mt-0.5 size-5 shrink-0 text-(--color-primary)" aria-hidden="true" strokeWidth={1.8} />
          <dl>
            <dt className="text-sm font-semibold text-(--color-dark)">Correo</dt>
            <dd className="mt-1">
              <a
                href={`mailto:${settings.email}`}
                className="text-(--color-dark) underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              >
                {settings.email}
              </a>
            </dd>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          href={whatsappWithMessage(settings.phone, settings.messages.whatsappDefault)}
          external
          variant="primary"
          size="lg"
        >
          <FaWhatsapp className="size-5" aria-hidden="true" />
          Pedir por WhatsApp
        </Button>
        <a
          href={settings.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-(--color-primary) transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          style={{ border: '1px solid var(--color-primary)' }}
        >
          <FaInstagram className="size-4" aria-hidden="true" />
          {settings.instagramHandle}
        </a>
      </div>
    </div>
  );
}
