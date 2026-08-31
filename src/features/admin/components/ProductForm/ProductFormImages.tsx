'use client';

import { FormField } from '@/components/ui/FormField';
import ImageUploader from '@/features/admin/components/ImageUploader';
import type { ProductFormData } from '@/features/admin/types';

import { FieldError } from './FieldError';
import ProductGalleryManager from './ProductGalleryManager';
import type { FieldErrors } from './validation';

interface Props {
  form: ProductFormData;
  fieldErrors: FieldErrors;
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

export default function ProductFormImages({ form, fieldErrors, setField }: Props) {
  const imageUrlError = fieldErrors.imageUrl;
  const imagesError = Object.entries(fieldErrors).find(([key]) => key.startsWith('images'))?.[1];
  const gallery = form.imageUrl
    ? [form.imageUrl, ...form.images.filter((url) => url !== form.imageUrl)]
    : form.images;

  function setGallery(urls: string[]) {
    setField('imageUrl', urls[0] ?? '');
    setField('images', urls.slice(1));
  }

  function handleRemove(url: string) {
    setGallery(gallery.filter((item) => item !== url));
    const remainingAlts = Object.fromEntries(
      Object.entries(form.imageAlts).filter(([key]) => key !== url),
    );
    setField('imageAlts', remainingAlts);
  }

  return (
    <>
      <FormField label="Fotos del producto" required>
        <ImageUploader multiple value={gallery} onChange={setGallery} folder="productos" />
        <FieldError id="product-imageUrl-error" message={imageUrlError} />
        <FieldError id="product-images-error" message={imagesError} />
      </FormField>

      <ProductGalleryManager
        images={gallery}
        altTexts={form.imageAlts}
        onReorder={setGallery}
        onSetPrimary={(url) => setGallery([url, ...gallery.filter((item) => item !== url)])}
        onRemove={handleRemove}
        onChangeAlt={(url, alt) => setField('imageAlts', { ...form.imageAlts, [url]: alt })}
      />
    </>
  );
}
