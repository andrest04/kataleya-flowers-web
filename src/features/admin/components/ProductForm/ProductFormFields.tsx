'use client';

import { FormField } from '@/components/ui/FormField';
import { Input, Select,Textarea } from '@/components/ui/Input';
import type { ProductFormData } from '@/features/admin/types';
import type { CategoryRow } from '@/lib/db/rows';

import { FieldError } from './FieldError';
import type { FieldErrors } from './validation';

interface Props {
  form: ProductFormData;
  categories: CategoryRow[];
  fieldErrors: FieldErrors;
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
  setName: (name: string) => void;
  regenerateSlug: () => void;
  isEditing: boolean;
}

const ID_NAME = 'product-name';
const ID_SLUG = 'product-slug';
const ID_DESC = 'product-description';
const ID_CAT = 'product-category';
const ID_PRICE = 'product-price';

export default function ProductFormFields({
  form,
  categories,
  fieldErrors,
  setField,
  setName,
  regenerateSlug,
  isEditing,
}: Props) {
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
            aria-required="true"
            placeholder="Ramo de rosas rojas"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? `${ID_NAME}-error` : undefined}
          />
          <FieldError id={`${ID_NAME}-error`} message={nameError} />
        </FormField>
        <FormField label="Slug" htmlFor={ID_SLUG}>
          <div className="flex items-center gap-2">
            <Input
              id={ID_SLUG}
              type="text"
              value={form.slug}
              placeholder="se genera desde el nombre"
              readOnly
              aria-readonly="true"
              className="flex-1"
            />
            {isEditing && (
              <button
                type="button"
                onClick={regenerateSlug}
                className="text-xs underline text-(--color-primary) hover:opacity-80 cursor-pointer"
                aria-label="Regenerar slug desde el nombre. Cambiar el slug puede romper URLs públicas indexadas."
                title="Cambiar el slug puede romper URLs públicas indexadas."
              >
                Regenerar
              </button>
            )}
          </div>
        </FormField>
      </div>

      <FormField label="Descripción" required htmlFor={ID_DESC}>
        <Textarea
          id={ID_DESC}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          required
          aria-required="true"
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
            aria-required="true"
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
            aria-required="true"
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
