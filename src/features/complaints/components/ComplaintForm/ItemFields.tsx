'use client';

import { FieldError } from '@/components/ui/FieldError';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';

import type { ComplaintFormData } from '../../schemas/complaint';
import { ITEM_TYPES } from '../../schemas/constants';

interface ItemFieldsProps {
  errors: Record<string, string>;
  values?: ComplaintFormData;
}

const ITEM_LABEL: Record<(typeof ITEM_TYPES)[number], string> = {
  PRODUCTO: 'Producto',
  SERVICIO: 'Servicio',
};

export default function ItemFields({ errors, values }: ItemFieldsProps) {
  const amount = values?.claimedAmount;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo" required htmlFor="itemType">
          <Select id="itemType" name="itemType" defaultValue={values?.itemType ?? 'PRODUCTO'}>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {ITEM_LABEL[t]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Monto reclamado (S/)" htmlFor="claimedAmount">
          <Input
            id="claimedAmount"
            name="claimedAmount"
            defaultValue={amount !== undefined && Number.isFinite(amount) ? amount : ''}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="Opcional"
            aria-invalid={!!errors.claimedAmount}
            aria-describedby="err-claimedAmount"
          />
          <FieldError id="err-claimedAmount" message={errors.claimedAmount} />
        </FormField>
      </div>

      <FormField label="Descripción del bien contratado" required htmlFor="itemDescription">
        <Textarea
          id="itemDescription"
          name="itemDescription"
          defaultValue={values?.itemDescription}
          rows={3}
          required
          aria-required="true"
          aria-invalid={!!errors.itemDescription}
          aria-describedby="err-itemDescription"
        />
        <FieldError id="err-itemDescription" message={errors.itemDescription} />
      </FormField>
    </div>
  );
}
