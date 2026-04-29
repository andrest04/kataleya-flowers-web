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
  includeKeys: string[];
  fieldErrors: FieldErrors;
  addInclude: () => void;
  updateInclude: (i: number, val: string) => void;
  removeInclude: (i: number) => void;
}

export default function ProductFormIncludes({
  form,
  includeKeys,
  fieldErrors,
  addInclude,
  updateInclude,
  removeInclude,
}: Props) {
  return (
    <FormField label="¿Qué incluye?">
      <div className="space-y-2">
        {form.includes.map((item, i) => {
          const itemError = fieldErrors[`includes.${String(i)}`];
          return (
            <div key={includeKeys[i]} className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={item}
                  onChange={(e) => updateInclude(i, e.target.value)}
                  placeholder="ej. 24 rosas rojas"
                  style={{ flex: 1 }}
                  aria-invalid={Boolean(itemError)}
                  aria-describedby={itemError ? `include-${String(i)}-error` : undefined}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeInclude(i)}
                  className="px-2"
                  aria-label="Eliminar ítem"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <FieldError id={`include-${String(i)}-error`} message={itemError} />
            </div>
          );
        })}
        <Button variant="ghost" size="sm" onClick={addInclude}>
          <Plus className="w-4 h-4" /> Agregar ítem
        </Button>
      </div>
    </FormField>
  );
}
