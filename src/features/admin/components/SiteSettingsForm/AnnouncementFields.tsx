'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import type { SiteSettingsDraft } from './types';

interface AnnouncementFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

export default function AnnouncementFields({ draft, errors, onChange }: AnnouncementFieldsProps) {
  return (
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
  );
}
