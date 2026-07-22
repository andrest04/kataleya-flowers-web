'use client';

import { FormField } from '@/components/ui/FormField';
import ImageUploader from '@/features/admin/components/ImageUploader';
import type { ProductFormData } from '@/features/admin/types';

import { FieldError } from './FieldError';
import type { FieldErrors } from './validation';

interface Props {
  form: ProductFormData;
  fieldErrors: FieldErrors;
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

export default function ProductFormImages({ form, fieldErrors, setField }: Props) {
  const imageUrlError = fieldErrors.imageUrl;
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
