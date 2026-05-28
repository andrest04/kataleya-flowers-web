'use client';

import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import { ITEM_TYPES } from '../../schemas/complaint';

interface ItemFieldsProps {
  errors: Record<string, string>;
}

const ITEM_LABEL: Record<(typeof ITEM_TYPES)[number], string> = {
  PRODUCTO: 'Producto',
  SERVICIO: 'Servicio',
};

export default function ItemFields({ errors }: ItemFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo" required htmlFor="itemType">
          <Select id="itemType" name="itemType" defaultValue="PRODUCTO">
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
