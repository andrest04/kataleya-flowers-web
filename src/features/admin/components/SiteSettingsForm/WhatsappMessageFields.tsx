'use client';

import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import type { SiteSettingsDraft } from './types';

interface WhatsappMessageFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

export default function WhatsappMessageFields({ draft, errors, onChange }: WhatsappMessageFieldsProps) {
  return (
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
  );
}
