'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import type { SiteSettingsDraft } from './types';

interface IdentityFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

export default function IdentityFields({ draft, errors, onChange }: IdentityFieldsProps) {
  return (
    <SectionCard className="xl:col-span-2" headingId="settings-identity-heading" title="Identidad">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nombre del negocio" required htmlFor={fieldId('name')}>
          <Input
            id={fieldId('name')}
            autoComplete="organization"
            value={draft.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? fieldId('name-error') : undefined}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <FieldError id={fieldId('name-error')} message={errors.name} />
        </FormField>
        <FormField label="Sitio web" required htmlFor={fieldId('website')}>
          <Input
            id={fieldId('website')}
            type="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://www.tudominio.com"
            value={draft.website}
            aria-invalid={Boolean(errors.website)}
            aria-describedby={errors.website ? fieldId('website-error') : undefined}
            onChange={(event) => onChange({ website: event.target.value })}
          />
          <FieldError id={fieldId('website-error')} message={errors.website} />
        </FormField>
      </div>
    </SectionCard>
  );
}
