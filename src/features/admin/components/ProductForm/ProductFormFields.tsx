'use client';

import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { FieldError } from './FieldError';
import type { FieldErrors } from './validation';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface Props {
  form: ProductFormData;
  categories: CategoryRow[];
  fieldErrors: FieldErrors;
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
  setName: (name: string) => void;
}

const ID_NAME = 'product-name';
const ID_SLUG = 'product-slug';
const ID_DESC = 'product-description';
const ID_CAT = 'product-category';
const ID_PRICE = 'product-price';

export default function ProductFormFields({ form, categories, fieldErrors, setField, setName }: Props) {
  const nameError = fieldErrors.name;
  const descError = fieldErrors.description;
  const catError = fieldErrors.categoryId;
  const priceError = fieldErrors.price;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre" required htmlFor={ID_NAME}>
          <Input
            id={ID_NAME}
            type="text"
            value={form.name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ramo de rosas rojas"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? `${ID_NAME}-error` : undefined}
          />
          <FieldError id={`${ID_NAME}-error`} message={nameError} />
        </FormField>
        <FormField label="Slug" htmlFor={ID_SLUG}>
          <Input
            id={ID_SLUG}
            type="text"
            value={form.slug}
            placeholder="se genera desde el nombre"
            readOnly
          />
        </FormField>
      </div>

      <FormField label="Descripción" required htmlFor={ID_DESC}>
        <Textarea
          id={ID_DESC}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          required
          rows={3}
          placeholder="Descripción del producto…"
          aria-invalid={Boolean(descError)}
          aria-describedby={descError ? `${ID_DESC}-error` : undefined}
        />
        <FieldError id={`${ID_DESC}-error`} message={descError} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Categoría" required htmlFor={ID_CAT}>
          <Select
            id={ID_CAT}
            value={form.categoryId}
            onChange={(e) => setField('categoryId', e.target.value)}
            required
            aria-invalid={Boolean(catError)}
            aria-describedby={catError ? `${ID_CAT}-error` : undefined}
          >
            <option value="">Seleccioná una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <FieldError id={`${ID_CAT}-error`} message={catError} />
        </FormField>
        <FormField label="Precio base (S/)" required htmlFor={ID_PRICE}>
          <Input
            id={ID_PRICE}
            type="number"
            value={form.price}
            onChange={(e) => setField('price', Number(e.target.value))}
            required
            min={0}
            step={0.01}
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? `${ID_PRICE}-error` : undefined}
          />
          <FieldError id={`${ID_PRICE}-error`} message={priceError} />
        </FormField>
      </div>
    </>
  );
}
