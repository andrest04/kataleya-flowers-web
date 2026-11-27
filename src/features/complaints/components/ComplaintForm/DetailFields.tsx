"use client";

import { Check } from "lucide-react";

import { FieldError } from "@/components/ui/FieldError";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Input";

import type { ComplaintFormData } from "../../schemas/complaint";
import type { ComplaintType } from "../../types";
import FieldHint from "./FieldHint";
import { TEXTAREA_CLASS } from "./fieldStyles";

interface DetailFieldsProps {
  errors: Record<string, string>;
  values?: ComplaintFormData;
  value: ComplaintType;
  onChange: (value: ComplaintType) => void;
}

const OPTIONS: { value: ComplaintType; title: string; desc: string }[] = [
  {
    value: "RECLAMO",
    title: "Reclamo",
    desc: "Disconformidad con el producto o servicio.",
  },
  {
    value: "QUEJA",
    title: "Queja",
    desc: "Malestar respecto a la atención al cliente.",
  },
];

export default function DetailFields({
  errors,
  values,
  value,
  onChange,
}: DetailFieldsProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium mb-2 text-(--color-dark)">
          Reclamo / Queja <span className="text-primary">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const selected = value === opt.value;
            return (
              <label
                key={opt.value}
                className={`relative block min-h-11 cursor-pointer rounded-xl border p-4 text-left transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--color-primary) ${
                  selected
                    ? "border-2 border-(--color-dark) bg-[color-mix(in_srgb,var(--color-secondary)_7%,var(--color-white))]"
                    : "border-[color-mix(in_srgb,var(--color-dark)_55%,var(--color-cream))] bg-[color-mix(in_srgb,var(--color-secondary)_7%,var(--color-white))] hover:border-(--color-dark)"
                }`}
              >
                <input
                  type="radio"
                  name="complaintType"
                  value={opt.value}
                  checked={selected}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2 font-semibold text-(--color-dark)">
                  {opt.title}
                  {selected && (
                    <Check size={18} strokeWidth={2.5} aria-hidden="true" />
                  )}
                </span>
                <span className="block text-sm mt-1 text-(--color-dark)">
                  {opt.desc}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <FormField label="Detalle de lo ocurrido" required htmlFor="detail">
        <Textarea
          className={TEXTAREA_CLASS}
          id="detail"
          name="detail"
          defaultValue={values?.detail}
          rows={4}
          required
          aria-required="true"
          aria-invalid={!!errors.detail}
          aria-describedby="help-detail err-detail"
        />
        <FieldHint id="help-detail">
          Cuéntanos qué pasó, cuándo y cómo, con los datos que recuerdes.
        </FieldHint>
        <FieldError id="err-detail" message={errors.detail} />
      </FormField>

      <FormField
        label="Pedido concreto del consumidor"
        required
        htmlFor="consumerRequest"
      >
        <Textarea
          className={TEXTAREA_CLASS}
          id="consumerRequest"
          name="consumerRequest"
          defaultValue={values?.consumerRequest}
          rows={3}
          required
          aria-required="true"
          aria-invalid={!!errors.consumerRequest}
          aria-describedby="help-consumerRequest err-consumerRequest"
        />
        <FieldHint id="help-consumerRequest">
          Dinos qué solución esperas, por ejemplo un cambio o la devolución de
          tu pago.
        </FieldHint>
        <FieldError id="err-consumerRequest" message={errors.consumerRequest} />
      </FormField>
    </div>
  );
}
