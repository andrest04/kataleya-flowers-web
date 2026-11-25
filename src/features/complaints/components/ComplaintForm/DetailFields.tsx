'use client';

import { FieldError } from '@/components/ui/FieldError';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Input';

import type { ComplaintFormData } from '../../schemas/complaint';
import type { ComplaintType } from '../../types';

interface DetailFieldsProps {
  errors: Record<string, string>;
  values?: ComplaintFormData;
  value: ComplaintType;
  onChange: (value: ComplaintType) => void;
}

const OPTIONS: { value: ComplaintType; title: string; desc: string; color: string }[] = [
  {
    value: 'RECLAMO',
    title: 'Reclamo',
    desc: 'Disconformidad con el producto o servicio.',
    color: 'var(--color-primary)',
  },
  {
    value: 'QUEJA',
    title: 'Queja',
    desc: 'Malestar respecto a la atención al cliente.',
    color: 'var(--color-accent)',
  },
];

export default function DetailFields({ errors, values, value, onChange }: DetailFieldsProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium mb-2 text-(--color-dark)">
          Tipo de reclamación <span className="text-primary">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const selected = value === opt.value;
            return (
              <label
                key={opt.value}
                className="block min-h-11 cursor-pointer rounded-xl border p-4 text-left transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--color-primary)"
                style={{
                  borderColor: selected ? opt.color : 'var(--color-border)',
                  background: selected
                    ? `color-mix(in srgb, ${opt.color} 8%, var(--color-white))`
                    : 'var(--color-white)',
                }}
              >
                <input
                  type="radio"
                  name="complaintType"
                  value={opt.value}
                  checked={selected}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <span className="block font-semibold" style={{ color: opt.color }}>
                  {opt.title}
                </span>
                <span className="block text-sm mt-1 text-(--color-dark)">{opt.desc}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <FormField label="Detalle de lo ocurrido" required htmlFor="detail">
        <Textarea
          id="detail"
          name="detail"
          defaultValue={values?.detail}
          rows={4}
          required
          aria-required="true"
          aria-invalid={!!errors.detail}
          aria-describedby="err-detail"
        />
        <FieldError id="err-detail" message={errors.detail} />
      </FormField>

      <FormField label="Pedido concreto del consumidor" required htmlFor="consumerRequest">
        <Textarea
          id="consumerRequest"
          name="consumerRequest"
          defaultValue={values?.consumerRequest}
          rows={3}
          required
          aria-required="true"
          aria-invalid={!!errors.consumerRequest}
          aria-describedby="err-consumerRequest"
        />
        <FieldError id="err-consumerRequest" message={errors.consumerRequest} />
      </FormField>
    </div>
  );
}
