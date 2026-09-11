'use client';

import { FormField } from '@/components/ui/FormField';
import { Input, Select } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import type { FieldErrors } from './formErrors';
import type { PromoBannerCtaType, PromoBannerDraft } from './types';

interface CtaFieldsProps {
  ctaLabel: string;
  ctaType: PromoBannerCtaType;
  ctaValue: string;
  errors: FieldErrors;
  idPrefix: string;
  onChange: (patch: Partial<PromoBannerDraft>) => void;
}

export default function CtaFields({ ctaLabel, ctaType, ctaValue, errors, idPrefix, onChange }: CtaFieldsProps) {
  return (
    <>
      <FormField label="El botón lleva a" htmlFor={`${idPrefix}-cta-type`}>
        <Select
          id={`${idPrefix}-cta-type`}
          value={ctaType}
          onChange={(event) => onChange({ ctaType: event.target.value as PromoBannerCtaType })}
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="catalogo">Catálogo</option>
          <option value="url">Otra URL</option>
        </Select>
      </FormField>
      <FormField label="Texto del botón" required htmlFor={`${idPrefix}-cta-label`}>
        <Input
          id={`${idPrefix}-cta-label`}
          value={ctaLabel}
          aria-invalid={Boolean(errors.ctaLabel)}
          aria-describedby={errors.ctaLabel ? `${idPrefix}-cta-label-error` : undefined}
          onChange={(event) => onChange({ ctaLabel: event.target.value })}
          placeholder={ctaType === 'catalogo' ? 'Ver catálogo' : 'Pedir por WhatsApp'}
        />
        <FieldError id={`${idPrefix}-cta-label-error`} message={errors.ctaLabel} />
      </FormField>
      {ctaType === 'url' ? (
        <FormField label="URL del botón" required htmlFor={`${idPrefix}-cta-value`}>
          <Input
            id={`${idPrefix}-cta-value`}
            type="url"
            value={ctaValue}
            aria-invalid={Boolean(errors.ctaValue)}
            aria-describedby={errors.ctaValue ? `${idPrefix}-cta-value-error` : undefined}
            onChange={(event) => onChange({ ctaValue: event.target.value })}
          />
          <FieldError id={`${idPrefix}-cta-value-error`} message={errors.ctaValue} />
        </FormField>
      ) : null}
    </>
  );
}
