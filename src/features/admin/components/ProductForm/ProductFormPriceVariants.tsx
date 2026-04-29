'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ProductFormData } from '@/features/admin/types';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { FieldError } from './FieldError';
import type { FieldErrors } from './validation';

interface Props {
  form: ProductFormData;
  variantKeys: string[];
  fieldErrors: FieldErrors;
  addPriceVariant: () => void;
  updateVariantField: (i: number, field: 'label' | 'price', val: string) => void;
  removeVariant: (i: number) => void;
}

export default function ProductFormPriceVariants({
  form,
  variantKeys,
  fieldErrors,
  addPriceVariant,
  updateVariantField,
  removeVariant,
}: Props) {
  return (
    <FormField label="Variantes de precio">
      <div className="space-y-2">
        {(form.priceVariants ?? []).map((v, i) => {
          const labelError = fieldErrors[`priceVariants.${String(i)}.label`];
          const priceError = fieldErrors[`priceVariants.${String(i)}.price`];
          return (
            <div key={variantKeys[i]} className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  value={v.label}
                  onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                  placeholder="ej. 12 rosas"
                  style={{ flex: 2 }}
                  aria-invalid={Boolean(labelError)}
                />
                <Input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariantField(i, 'price', e.target.value)}
                  placeholder="Precio"
                  min={0}
                  step={0.01}
                  style={{ flex: 1 }}
                  aria-invalid={Boolean(priceError)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeVariant(i)}
                  className="px-2"
                  aria-label="Eliminar variante"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <FieldError message={labelError ?? priceError} />
            </div>
          );
        })}
        <Button variant="ghost" size="sm" onClick={addPriceVariant}>
          <Plus className="w-4 h-4" /> Agregar variante
        </Button>
      </div>
    </FormField>
  );
}
