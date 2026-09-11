'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import type { FieldErrors } from './formErrors';

interface SharedFieldsProps {
  allowHide: boolean;
  endsAt: string;
  errors: FieldErrors;
  isActive: boolean;
  name: string;
  onEndsAtChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
  onNameChange: (value: string) => void;
  onStartsAtChange: (value: string) => void;
  startsAt: string;
}

export default function SharedFields({
  allowHide,
  endsAt,
  errors,
  isActive,
  name,
  onEndsAtChange,
  onIsActiveChange,
  onNameChange,
  onStartsAtChange,
  startsAt,
}: SharedFieldsProps) {
  return (
    <div className="grid gap-4 rounded-xl border border-(--color-border) bg-(--color-white) p-4 md:grid-cols-2">
      <FormField label="Nombre" required htmlFor="preset-name">
        <Input
          id="preset-name"
          value={name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'preset-name-error' : undefined}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Flores Amarillas"
        />
        <FieldError id="preset-name-error" message={errors.name} />
      </FormField>
      <div className="flex items-center gap-3">
        <ToggleSwitch
          checked={isActive}
          disabled={!allowHide && isActive}
          label={isActive ? 'Ocultar en la portada' : 'Mostrar en la portada'}
          onChange={(checked) => {
            if (!checked && !allowHide) return;
            onIsActiveChange(checked);
          }}
        />
        <span className="text-sm text-(--color-dark)">{isActive ? 'Visible' : 'Oculto'}</span>
      </div>
      <FormField label="Mostrar desde" htmlFor="preset-starts">
        <Input
          id="preset-starts"
          type="datetime-local"
          value={startsAt}
          aria-invalid={Boolean(errors.startsAt)}
          aria-describedby={errors.startsAt ? 'preset-starts-error' : undefined}
          onChange={(event) => onStartsAtChange(event.target.value)}
        />
        <FieldError id="preset-starts-error" message={errors.startsAt} />
      </FormField>
      <FormField label="Ocultar desde" htmlFor="preset-ends">
        <Input
          id="preset-ends"
          type="datetime-local"
          value={endsAt}
          aria-invalid={Boolean(errors.endsAt)}
          aria-describedby={errors.endsAt ? 'preset-ends-error' : undefined}
          onChange={(event) => onEndsAtChange(event.target.value)}
        />
        <FieldError id="preset-ends-error" message={errors.endsAt} />
      </FormField>
    </div>
  );
}
