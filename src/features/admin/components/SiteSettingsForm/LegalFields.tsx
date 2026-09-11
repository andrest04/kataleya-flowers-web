'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import type { SiteSettingsDraft } from './types';

interface LegalFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

export default function LegalFields({ draft, errors, onChange }: LegalFieldsProps) {
  return (
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
  );
}
