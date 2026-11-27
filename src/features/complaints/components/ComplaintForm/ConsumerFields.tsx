"use client";

import { FieldError } from "@/components/ui/FieldError";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

import type { ComplaintFormData } from "../../schemas/complaint";
import { DOC_TYPES } from "../../schemas/constants";
import { FIELD_CLASS, SELECT_CLASS } from "./fieldStyles";

const MINOR_LABEL = "Represento a un menor de edad";

interface ConsumerFieldsProps {
  errors: Record<string, string>;
  values?: ComplaintFormData;
  isMinor: boolean;
  onMinorChange: (value: boolean) => void;
}

export default function ConsumerFields({
  errors,
  values,
  isMinor,
  onMinorChange,
}: ConsumerFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField label="Nombre completo" required htmlFor="consumerName">
        <Input
          className={FIELD_CLASS}
          id="consumerName"
          name="consumerName"
          defaultValue={values?.consumerName}
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={!!errors.consumerName}
          aria-describedby="err-consumerName"
        />
        <FieldError id="err-consumerName" message={errors.consumerName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo de documento" required htmlFor="consumerDocType">
          <Select
            className={SELECT_CLASS}
            id="consumerDocType"
            name="consumerDocType"
            defaultValue={values?.consumerDocType ?? "DNI"}
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="N° de documento" required htmlFor="consumerDocNumber">
          <Input
            className={FIELD_CLASS}
            id="consumerDocNumber"
            name="consumerDocNumber"
            defaultValue={values?.consumerDocNumber}
            required
            aria-required="true"
            aria-invalid={!!errors.consumerDocNumber}
            aria-describedby="err-consumerDocNumber"
          />
          <FieldError
            id="err-consumerDocNumber"
            message={errors.consumerDocNumber}
          />
        </FormField>
      </div>

      <FormField label="Domicilio" required htmlFor="consumerAddress">
        <Input
          className={FIELD_CLASS}
          id="consumerAddress"
          name="consumerAddress"
          defaultValue={values?.consumerAddress}
          autoComplete="street-address"
          required
          aria-required="true"
          aria-invalid={!!errors.consumerAddress}
          aria-describedby="err-consumerAddress"
        />
        <FieldError id="err-consumerAddress" message={errors.consumerAddress} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Teléfono (opcional)" htmlFor="consumerPhone">
          <Input
            className={FIELD_CLASS}
            id="consumerPhone"
            name="consumerPhone"
            defaultValue={values?.consumerPhone}
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.consumerPhone}
            aria-describedby="err-consumerPhone"
          />
          <FieldError id="err-consumerPhone" message={errors.consumerPhone} />
        </FormField>
        <FormField label="Email" required htmlFor="consumerEmail">
          <Input
            className={FIELD_CLASS}
            id="consumerEmail"
            name="consumerEmail"
            defaultValue={values?.consumerEmail}
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={!!errors.consumerEmail}
            aria-describedby="err-consumerEmail"
          />
          <FieldError id="err-consumerEmail" message={errors.consumerEmail} />
        </FormField>
      </div>

      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 pt-1">
        <ToggleSwitch
          checked={isMinor}
          onChange={onMinorChange}
          label={MINOR_LABEL}
        />
        <span className="text-sm text-(--color-dark)">{MINOR_LABEL}</span>
      </label>

      {isMinor && (
        <FormField
          label="Nombre del padre, madre o apoderado"
          required
          htmlFor="guardianName"
        >
          <Input
            className={FIELD_CLASS}
            id="guardianName"
            name="guardianName"
            defaultValue={values?.guardianName}
            aria-invalid={!!errors.guardianName}
            aria-describedby="err-guardianName"
          />
          <FieldError id="err-guardianName" message={errors.guardianName} />
        </FormField>
      )}
    </div>
  );
}
