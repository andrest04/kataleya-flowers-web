'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/primitives/checkbox';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { type FieldErrors, fieldId } from './formErrors';
import SectionCard from './SectionCard';
import { type SiteSettingsDraft, WEEKDAYS } from './types';

interface HoursFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

function toggleDay(current: number[], value: number): number[] {
  if (current.includes(value)) return current.filter((day) => day !== value);
  return [...current, value];
}

export default function HoursFields({ draft, errors, onChange }: HoursFieldsProps) {
  return (
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
                onCheckedChange={() => onChange({ openDays: toggleDay(draft.openDays, day.value) })}
              />
              {day.label}
            </label>
          ))}
        </div>
        <FieldError id={fieldId('openDays-error')} message={errors.openDays} />
      </fieldset>
    </SectionCard>
  );
}
