'use client';

import { FormField } from '@/components/ui/FormField';
import { Input, Textarea } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/primitives/checkbox';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors,fieldId } from './formErrors';
import SectionCard from './SectionCard';
import { type SiteSettingsDraft, WEEKDAYS } from './types';

interface SiteSettingsFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

function toggleDay(current: number[], value: number): number[] {
  if (current.includes(value)) return current.filter((day) => day !== value);
  return [...current, value];
}

export default function SiteSettingsFields({
  draft,
  errors,
  onChange,
}: SiteSettingsFieldsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard
        className="xl:col-span-2"
        headingId="settings-contact-heading"
        title="Contacto"
      >
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
                className="absolute inset-0 size-full border-0"
              />
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard headingId="settings-hours-heading" title="Horarios">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Días" required htmlFor={fieldId('hoursWeekdays')}>
            <Input
              id={fieldId('hoursWeekdays')}
              value={draft.hoursWeekdays}
              aria-invalid={Boolean(errors.hoursWeekdays)}
              aria-describedby={errors.hoursWeekdays ? fieldId('hoursWeekdays-error') : undefined}
              onChange={(event) => onChange({ hoursWeekdays: event.target.value })}
            />
            <FieldError id={fieldId('hoursWeekdays-error')} message={errors.hoursWeekdays} />
          </FormField>
          <FormField label="Horario" required htmlFor={fieldId('hoursTime')}>
            <Input
              id={fieldId('hoursTime')}
              value={draft.hoursTime}
              aria-invalid={Boolean(errors.hoursTime)}
              aria-describedby={errors.hoursTime ? fieldId('hoursTime-error') : undefined}
              onChange={(event) => onChange({ hoursTime: event.target.value })}
            />
            <FieldError id={fieldId('hoursTime-error')} message={errors.hoursTime} />
          </FormField>
          <FormField label="Abre" required htmlFor={fieldId('hoursOpens')}>
            <Input
              id={fieldId('hoursOpens')}
              type="time"
              value={draft.hoursOpens}
              aria-invalid={Boolean(errors.hoursOpens)}
              aria-describedby={errors.hoursOpens ? fieldId('hoursOpens-error') : undefined}
              onChange={(event) => onChange({ hoursOpens: event.target.value })}
            />
            <FieldError id={fieldId('hoursOpens-error')} message={errors.hoursOpens} />
          </FormField>
          <FormField label="Cierra" required htmlFor={fieldId('hoursCloses')}>
            <Input
              id={fieldId('hoursCloses')}
              type="time"
              value={draft.hoursCloses}
              aria-invalid={Boolean(errors.hoursCloses)}
              aria-describedby={errors.hoursCloses ? fieldId('hoursCloses-error') : undefined}
              onChange={(event) => onChange({ hoursCloses: event.target.value })}
            />
            <FieldError id={fieldId('hoursCloses-error')} message={errors.hoursCloses} />
          </FormField>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Días abierto
            <span className="text-primary"> *</span>
          </legend>
          <div id={fieldId('openDays')} className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <label
                key={day.value}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-(--color-dark)"
              >
                <Checkbox
                  checked={draft.openDays.includes(day.value)}
                  aria-invalid={Boolean(errors.openDays)}
                  onCheckedChange={() =>
                    onChange({ openDays: toggleDay(draft.openDays, day.value) })
                  }
                />
                {day.label}
              </label>
            ))}
          </div>
          <FieldError id={fieldId('openDays-error')} message={errors.openDays} />
        </fieldset>
      </SectionCard>

      <SectionCard headingId="settings-legal-heading" title="Legal">
        <FormField label="Razón social" required htmlFor={fieldId('razonSocial')}>
          <Input
            id={fieldId('razonSocial')}
            autoComplete="organization"
            value={draft.razonSocial}
            aria-invalid={Boolean(errors.razonSocial)}
            aria-describedby={errors.razonSocial ? fieldId('razonSocial-error') : undefined}
            onChange={(event) => onChange({ razonSocial: event.target.value })}
          />
          <FieldError id={fieldId('razonSocial-error')} message={errors.razonSocial} />
        </FormField>
        <FormField label="RUC" required htmlFor={fieldId('ruc')}>
          <Input
            id={fieldId('ruc')}
            inputMode="numeric"
            spellCheck={false}
            value={draft.ruc}
            aria-invalid={Boolean(errors.ruc)}
            aria-describedby={errors.ruc ? fieldId('ruc-error') : undefined}
            onChange={(event) => onChange({ ruc: event.target.value })}
          />
          <FieldError id={fieldId('ruc-error')} message={errors.ruc} />
        </FormField>
      </SectionCard>

      <SectionCard
        description="El texto que se abre en WhatsApp, según el botón."
        headingId="settings-whatsapp-heading"
        title="Mensajes de WhatsApp"
      >
        <FormField label="Pedir por WhatsApp" required htmlFor={fieldId('whatsappDefault')}>
          <Textarea
            id={fieldId('whatsappDefault')}
            rows={2}
            value={draft.whatsappDefault}
            aria-invalid={Boolean(errors.whatsappDefault)}
            aria-describedby={errors.whatsappDefault ? fieldId('whatsappDefault-error') : undefined}
            onChange={(event) => onChange({ whatsappDefault: event.target.value })}
          />
          <FieldError id={fieldId('whatsappDefault-error')} message={errors.whatsappDefault} />
        </FormField>
        <FormField label="Botón verde flotante" required htmlFor={fieldId('whatsappFloat')}>
          <Textarea
            id={fieldId('whatsappFloat')}
            rows={2}
            value={draft.whatsappFloat}
            aria-invalid={Boolean(errors.whatsappFloat)}
            aria-describedby={errors.whatsappFloat ? fieldId('whatsappFloat-error') : undefined}
            onChange={(event) => onChange({ whatsappFloat: event.target.value })}
          />
          <FieldError id={fieldId('whatsappFloat-error')} message={errors.whatsappFloat} />
        </FormField>
        <FormField label="Ficha de producto ({nombre})" required htmlFor={fieldId('whatsappProduct')}>
          <Textarea
            id={fieldId('whatsappProduct')}
            rows={2}
            value={draft.whatsappProduct}
            aria-invalid={Boolean(errors.whatsappProduct)}
            aria-describedby={errors.whatsappProduct ? fieldId('whatsappProduct-error') : undefined}
            onChange={(event) => onChange({ whatsappProduct: event.target.value })}
          />
          <FieldError id={fieldId('whatsappProduct-error')} message={errors.whatsappProduct} />
        </FormField>
      </SectionCard>

      <SectionCard headingId="settings-announcement-heading" title="Barra de anuncios">
        <FormField label="Texto" required htmlFor={fieldId('announcementText')}>
          <Input
            id={fieldId('announcementText')}
            value={draft.announcementText}
            aria-invalid={Boolean(errors.announcementText)}
            aria-describedby={errors.announcementText ? fieldId('announcementText-error') : undefined}
            onChange={(event) => onChange({ announcementText: event.target.value })}
          />
          <FieldError id={fieldId('announcementText-error')} message={errors.announcementText} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Texto del botón" required htmlFor={fieldId('announcementCtaLabel')}>
            <Input
              id={fieldId('announcementCtaLabel')}
              value={draft.announcementCtaLabel}
              aria-invalid={Boolean(errors.announcementCtaLabel)}
              aria-describedby={errors.announcementCtaLabel ? fieldId('announcementCtaLabel-error') : undefined}
              onChange={(event) => onChange({ announcementCtaLabel: event.target.value })}
            />
            <FieldError id={fieldId('announcementCtaLabel-error')} message={errors.announcementCtaLabel} />
          </FormField>
          <FormField label="Enlace del botón" htmlFor={fieldId('announcementCtaHref')}>
            <Input
              id={fieldId('announcementCtaHref')}
              autoComplete="off"
              spellCheck={false}
              placeholder="/catalogo"
              value={draft.announcementCtaHref}
              aria-invalid={Boolean(errors.announcementCtaHref)}
              aria-describedby={errors.announcementCtaHref ? fieldId('announcementCtaHref-error') : undefined}
              onChange={(event) => onChange({ announcementCtaHref: event.target.value })}
            />
            <FieldError id={fieldId('announcementCtaHref-error')} message={errors.announcementCtaHref} />
          </FormField>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={draft.announcementIsActive}
            label="Mostrar la barra de anuncios"
            onChange={(checked) => onChange({ announcementIsActive: checked })}
          />
          <span className="text-sm text-(--color-dark)">
            {draft.announcementIsActive ? 'Visible' : 'Oculta'}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Mostrar desde" htmlFor={fieldId('announcementStartsAt')}>
            <Input
              id={fieldId('announcementStartsAt')}
              type="datetime-local"
              value={draft.announcementStartsAt}
              aria-invalid={Boolean(errors.announcementStartsAt)}
              aria-describedby={errors.announcementStartsAt ? fieldId('announcementStartsAt-error') : undefined}
              onChange={(event) => onChange({ announcementStartsAt: event.target.value })}
            />
            <FieldError id={fieldId('announcementStartsAt-error')} message={errors.announcementStartsAt} />
          </FormField>
          <FormField label="Ocultar desde" htmlFor={fieldId('announcementEndsAt')}>
            <Input
              id={fieldId('announcementEndsAt')}
              type="datetime-local"
              value={draft.announcementEndsAt}
              aria-invalid={Boolean(errors.announcementEndsAt)}
              aria-describedby={errors.announcementEndsAt ? fieldId('announcementEndsAt-error') : undefined}
              onChange={(event) => onChange({ announcementEndsAt: event.target.value })}
            />
            <FieldError id={fieldId('announcementEndsAt-error')} message={errors.announcementEndsAt} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        className="xl:col-span-2"
        description="Títulos grandes de cada bloque en el inicio."
        headingId="settings-titles-heading"
        title="Textos de la portada"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            action={
              <a
                href="/#catalogo"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-(--color-primary) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              >
                Ver Catálogo
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            }
            label="Título de Catálogo"
            required
            htmlFor={fieldId('catalogTitle')}
          >
            <Input
              id={fieldId('catalogTitle')}
              value={draft.catalogTitle}
              aria-invalid={Boolean(errors.catalogTitle)}
              aria-describedby={errors.catalogTitle ? fieldId('catalogTitle-error') : undefined}
              onChange={(event) => onChange({ catalogTitle: event.target.value })}
            />
            <FieldError id={fieldId('catalogTitle-error')} message={errors.catalogTitle} />
          </FormField>
          <FormField
            action={
              <a
                href="/#nosotros"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-(--color-primary) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              >
                Ver Nosotros
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            }
            label="Título de Nosotros"
            required
            htmlFor={fieldId('discoverTitle')}
          >
            <Input
              id={fieldId('discoverTitle')}
              value={draft.discoverTitle}
              aria-invalid={Boolean(errors.discoverTitle)}
              aria-describedby={errors.discoverTitle ? fieldId('discoverTitle-error') : undefined}
              onChange={(event) => onChange({ discoverTitle: event.target.value })}
            />
            <FieldError id={fieldId('discoverTitle-error')} message={errors.discoverTitle} />
          </FormField>
          <FormField
            action={
              <a
                href="/#contacto"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-(--color-primary) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              >
                Ver Contacto
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            }
            label="Título de Contacto"
            required
            htmlFor={fieldId('contactTitle')}
          >
            <Input
              id={fieldId('contactTitle')}
              value={draft.contactTitle}
              aria-invalid={Boolean(errors.contactTitle)}
              aria-describedby={errors.contactTitle ? fieldId('contactTitle-error') : undefined}
              onChange={(event) => onChange({ contactTitle: event.target.value })}
            />
            <FieldError id={fieldId('contactTitle-error')} message={errors.contactTitle} />
          </FormField>
        </div>
      </SectionCard>
    </div>
  );
}
