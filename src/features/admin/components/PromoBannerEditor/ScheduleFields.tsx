'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import type { FieldErrors } from './formErrors';
import type { PromoBannerDraft } from './types';

interface ScheduleFieldsProps {
  allowHide: boolean;
  endsAt: string;
  errors: FieldErrors;
  idPrefix: string;
  isActive: boolean;
  onChange: (patch: Partial<PromoBannerDraft>) => void;
  startsAt: string;
}

export default function ScheduleFields({
  allowHide,
  endsAt,
  errors,
  idPrefix,
  isActive,
  onChange,
  startsAt,
}: ScheduleFieldsProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <ToggleSwitch
          checked={isActive}
          disabled={!allowHide && isActive}
          label={isActive ? 'Ocultar en la portada' : 'Mostrar en la portada'}
          onChange={(checked) => {
            if (!checked && !allowHide) return;
            onChange({ isActive: checked });
          }}
        />
        <span className="text-sm text-(--color-dark)">{isActive ? 'Visible' : 'Oculto'}</span>
      </div>
      <FormField label="Mostrar desde" htmlFor={`${idPrefix}-starts`}>
        <Input
          id={`${idPrefix}-starts`}
          type="datetime-local"
          value={startsAt}
          aria-invalid={Boolean(errors.startsAt)}
          aria-describedby={errors.startsAt ? `${idPrefix}-starts-error` : undefined}
          onChange={(event) => onChange({ startsAt: event.target.value })}
        />
        <FieldError id={`${idPrefix}-starts-error`} message={errors.startsAt} />
      </FormField>
      <FormField label="Ocultar desde" htmlFor={`${idPrefix}-ends`}>
        <Input
          id={`${idPrefix}-ends`}
          type="datetime-local"
          value={endsAt}
          aria-invalid={Boolean(errors.endsAt)}
          aria-describedby={errors.endsAt ? `${idPrefix}-ends-error` : undefined}
          onChange={(event) => onChange({ endsAt: event.target.value })}
        />
        <FieldError id={`${idPrefix}-ends-error`} message={errors.endsAt} />
      </FormField>
    </>
  );
}
