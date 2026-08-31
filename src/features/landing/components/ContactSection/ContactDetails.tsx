import { Clock, Mail, MapPin } from 'lucide-react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

import BusinessHoursBadge from '@/components/shared/BusinessHoursBadge';
import Button from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

export default function ContactDetails() {
  return (
    <div className="space-y-8">
      <dl className="space-y-6">
        <div className="flex gap-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-(--color-primary)" aria-hidden="true" strokeWidth={1.8} />
          <div>
            <dt className="text-sm font-semibold text-(--color-dark)">Dónde estamos</dt>
            <dd className="mt-1 text-(--color-dark)">{BUSINESS.address}</dd>
          </div>
        </div>

        <div className="flex gap-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-(--color-primary)" aria-hidden="true" strokeWidth={1.8} />
          <div>
            <dt className="flex flex-wrap items-center gap-2 text-sm font-semibold text-(--color-dark)">
              Horario de atención
              <BusinessHoursBadge />
            </dt>
            <dd className="mt-1 text-(--color-dark)">
              {BUSINESS.hours.weekdays} · {BUSINESS.hours.time}
            </dd>
          </div>
        </div>

        <div className="flex gap-4">
          <Mail className="mt-0.5 size-5 shrink-0 text-(--color-primary)" aria-hidden="true" strokeWidth={1.8} />
          <div>
            <dt className="text-sm font-semibold text-(--color-dark)">Correo</dt>
            <dd className="mt-1">
              <a
                href={`mailto:${BUSINESS.email}`}
                className="text-(--color-dark) underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              >
                {BUSINESS.email}
              </a>
            </dd>
          </div>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          href={BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault)}
          external
          variant="primary"
          size="lg"
        >
          <FaWhatsapp className="size-5" aria-hidden="true" />
          Pedir por WhatsApp
        </Button>
        <a
          href={BUSINESS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-(--color-primary) transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          style={{ border: '1px solid var(--color-primary)' }}
        >
          <FaInstagram className="size-4" aria-hidden="true" />
          {BUSINESS.instagramHandle}
        </a>
      </div>
    </div>
  );
}
