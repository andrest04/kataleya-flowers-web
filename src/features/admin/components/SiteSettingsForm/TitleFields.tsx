'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import type { SiteSettingsDraft } from './types';

interface TitleFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

function PreviewLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 text-xs font-medium text-(--color-primary) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
    >
      {label}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

export default function TitleFields({ draft, errors, onChange }: TitleFieldsProps) {
  return (
    <SectionCard
      className="xl:col-span-2"
      description="Títulos grandes de cada bloque en el inicio."
      headingId="settings-titles-heading"
      title="Textos de la portada"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          action={<PreviewLink href="/#catalogo" label="Ver Catálogo" />}
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
          action={<PreviewLink href="/#nosotros" label="Ver Nosotros" />}
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
          action={<PreviewLink href="/#contacto" label="Ver Contacto" />}
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
  );
}
