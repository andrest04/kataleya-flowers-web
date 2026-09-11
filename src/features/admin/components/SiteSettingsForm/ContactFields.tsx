'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import type { SiteSettingsDraft } from './types';

interface ContactFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

export default function ContactFields({ draft, errors, onChange }: ContactFieldsProps) {
  return (
    <SectionCard className="xl:col-span-2" headingId="settings-contact-heading" title="Contacto">
      <div
        className={
          draft.mapsEmbedUrl
            ? 'grid gap-6 lg:grid-cols-2 lg:items-stretch'
            : 'flex flex-col gap-4'
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Teléfono" required htmlFor={fieldId('phone')}>
            <Input
              id={fieldId('phone')}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              spellCheck={false}
              value={draft.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? fieldId('phone-error') : undefined}
              onChange={(event) => onChange({ phone: event.target.value })}
            />
            <FieldError id={fieldId('phone-error')} message={errors.phone} />
          </FormField>
          <FormField label="Email" required htmlFor={fieldId('email')}>
            <Input
              id={fieldId('email')}
              type="email"
              autoComplete="email"
              spellCheck={false}
              value={draft.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? fieldId('email-error') : undefined}
              onChange={(event) => onChange({ email: event.target.value })}
            />
            <FieldError id={fieldId('email-error')} message={errors.email} />
          </FormField>
          <FormField label="Instagram" required htmlFor={fieldId('instagramHandle')}>
            <Input
              id={fieldId('instagramHandle')}
              autoComplete="off"
              spellCheck={false}
              value={draft.instagramHandle}
              aria-invalid={Boolean(errors.instagramHandle)}
              aria-describedby={errors.instagramHandle ? fieldId('instagramHandle-error') : undefined}
              onChange={(event) => onChange({ instagramHandle: event.target.value })}
            />
            <FieldError id={fieldId('instagramHandle-error')} message={errors.instagramHandle} />
          </FormField>
          <FormField label="Dirección" required htmlFor={fieldId('address')}>
            <Input
              id={fieldId('address')}
              autoComplete="street-address"
              value={draft.address}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? fieldId('address-error') : undefined}
              onChange={(event) => onChange({ address: event.target.value })}
            />
            <FieldError id={fieldId('address-error')} message={errors.address} />
          </FormField>
          <FormField label="Ciudad" required htmlFor={fieldId('location')}>
            <Input
              id={fieldId('location')}
              autoComplete="address-level2"
              value={draft.location}
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? fieldId('location-error') : undefined}
              onChange={(event) => onChange({ location: event.target.value })}
            />
            <FieldError id={fieldId('location-error')} message={errors.location} />
          </FormField>
          <FormField label="Link de Google Maps" htmlFor={fieldId('mapsLink')}>
            <Input
              id={fieldId('mapsLink')}
              autoComplete="off"
              spellCheck={false}
              placeholder="https://maps.app.goo.gl/…"
              value={draft.mapsLink}
              aria-invalid={Boolean(errors.mapsLink)}
              aria-describedby={errors.mapsLink ? fieldId('mapsLink-error') : undefined}
              onChange={(event) => onChange({ mapsLink: event.target.value })}
            />
            <FieldError id={fieldId('mapsLink-error')} message={errors.mapsLink} />
          </FormField>
        </div>
        {draft.mapsEmbedUrl ? (
          <div className="relative min-h-64 overflow-hidden rounded-md bg-(--color-surface) outline outline-1 -outline-offset-1 outline-black/10 lg:min-h-full">
            <iframe
              src={draft.mapsEmbedUrl}
              title="Vista del mapa en el sitio"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
              className="absolute inset-0 size-full border-0"
            />
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
