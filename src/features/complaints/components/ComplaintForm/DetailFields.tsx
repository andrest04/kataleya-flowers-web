'use client';

import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import type { ComplaintType } from '../../types';

interface DetailFieldsProps {
  errors: Record<string, string>;
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

export default function DetailFields({ errors, value, onChange }: DetailFieldsProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium mb-2 text-(--color-dark)">
          Tipo de reclamación <span className="text-primary">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tipo de reclamación">
          {OPTIONS.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(opt.value)}
                className="rounded-xl border p-4 text-left transition-colors"
                style={{
                  borderColor: selected ? opt.color : 'var(--color-border)',
                  background: selected
                    ? `color-mix(in srgb, ${opt.color} 8%, var(--color-white))`
                    : 'var(--color-white)',
                }}
              >
                <span className="block font-semibold" style={{ color: opt.color }}>
                  {opt.title}
                </span>
                <span className="block text-sm mt-1 text-(--color-dark)">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <FormField label="Detalle de lo ocurrido" required htmlFor="detail">
        <Textarea
          id="detail"
          name="detail"
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
