'use client';

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import type { ProductFormData } from '@/features/admin/types';

import { FieldError } from './FieldError';
import type { FieldErrors } from './validation';

interface Props {
  form: ProductFormData;
  fieldErrors: FieldErrors;
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

const ID_OCCASION = 'product-occasion';
const ID_NOTE = 'product-note';
const ID_DISPLAY_ORDER = 'product-display-order';

export default function ProductFormFlags({ form, fieldErrors, setField }: Props) {
  const orderError = fieldErrors.displayOrder;

  return (
    <>
      {/* Ocasión + Nota */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ocasión" htmlFor={ID_OCCASION}>
          <Input
            id={ID_OCCASION}
            type="text"
            value={form.occasion}
            onChange={(e) => setField('occasion', e.target.value)}
            placeholder="ej. Perfecto para aniversarios"
          />
        </FormField>
        <FormField label="Nota" htmlFor={ID_NOTE}>
          <Input
            id={ID_NOTE}
            type="text"
            value={form.note}
            onChange={(e) => setField('note', e.target.value)}
            placeholder="ej. Incluye peluche"
          />
        </FormField>
      </div>

      {/* Visibilidad y orden */}
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Activo
            </span>
            <ToggleSwitch
              checked={form.isActive}
              onChange={(v) => setField('isActive', v)}
              label="Producto activo"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Destacado
            </span>
            <ToggleSwitch
              checked={form.isFeatured}
              onChange={(v) => setField('isFeatured', v)}
              label="Producto destacado"
            />
          </div>
        </div>
        <FormField label="Orden de visualización" htmlFor={ID_DISPLAY_ORDER}>
          <Input
            id={ID_DISPLAY_ORDER}
            type="number"
            value={form.displayOrder}
            onChange={(e) => setField('displayOrder', Number(e.target.value))}
            min={0}
            step={1}
            aria-invalid={Boolean(orderError)}
            aria-describedby={orderError ? `${ID_DISPLAY_ORDER}-error` : undefined}
          />
          <FieldError id={`${ID_DISPLAY_ORDER}-error`} message={orderError} />
        </FormField>
      </div>
    </>
  );
}
