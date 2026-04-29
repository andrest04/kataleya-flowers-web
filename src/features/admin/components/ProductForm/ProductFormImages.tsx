'use client';

import type { ProductFormData } from '@/features/admin/types';
import { FormField } from '@/components/ui/FormField';
import ImageUploader from '@/features/admin/components/ImageUploader';
import { FieldError } from './FieldError';
import type { FieldErrors } from './validation';

interface Props {
  form: ProductFormData;
  fieldErrors: FieldErrors;
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

export default function ProductFormImages({ form, fieldErrors, setField }: Props) {
  const imageUrlError = fieldErrors.imageUrl;
  // imágenes adicionales: zod emite errores en `images.<idx>` — agregamos un mensaje agrupado si hay alguno.
  const imagesError = Object.entries(fieldErrors).find(([key]) => key.startsWith('images'))?.[1];

  return (
    <>
      <FormField label="Imagen principal" required>
        <ImageUploader
          value={form.imageUrl}
          onChange={(url) => setField('imageUrl', url)}
          folder="productos"
        />
        <FieldError id="product-imageUrl-error" message={imageUrlError} />
      </FormField>

      <FormField label="Imágenes adicionales">
        <ImageUploader
          multiple
          value={form.images}
          onChange={(urls) => setField('images', urls)}
          folder="productos"
        />
        <FieldError id="product-images-error" message={imagesError} />
      </FormField>
    </>
  );
}
