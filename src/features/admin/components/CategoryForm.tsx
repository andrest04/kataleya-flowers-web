'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError,FormField } from '@/components/ui/FormField';
import { Input, Textarea } from '@/components/ui/Input';
import { createCategory, updateCategory } from '@/features/admin/actions/categories';
import ImageUploader from '@/features/admin/components/ImageUploader';
import type { CategoryFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import type { CategoryRow } from '@/lib/db/rows';

interface CategoryFormProps {
  category?: CategoryRow;
}

function rowToFormData(row: CategoryRow): Omit<CategoryFormData, 'displayOrder'> {
  return {
    name: row.name,
    // SEO: en edit preservamos el slug existente — regenerar a partir del nombre rompería
    // URLs ya indexadas. Solo se regenera para categorías nuevas o si el user lo pide.
    slug: row.slug,
    description: row.description,
    occasion: row.occasion ?? '',
    imageUrl: row.image_url ?? '',
    isActive: row.is_active,
    isFeatured: row.is_featured,
  };
}

interface FormState {
  error?: string;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const slugRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(category);
  const initial = category
    ? rowToFormData(category)
    : { name: '', slug: '', description: '', occasion: '', imageUrl: '', isActive: true, isFeatured: false };
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  // En modo create, el slug se deriva live del nombre.
  // En modo edit, NO se toca el slug original a menos que el user lo regenere a propósito.
  // No se lee durante render (solo dentro de handlers) → ref, no state.
  const autoSlugRef = useRef(!isEditing);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev: FormState, formData: FormData) => {
      const data: CategoryFormData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string,
        occasion: formData.get('occasion') as string,
        imageUrl: formData.get('imageUrl') as string,
        displayOrder: category?.display_order ?? 0,
        isActive: formData.get('isActive') === 'on',
        isFeatured: formData.get('isFeatured') === 'on',
      };

      const result = category
        ? await updateCategory(category.id, data)
        : await createCategory(data);

      if (!result.success) {
        return { error: result.error ?? 'Error desconocido' };
      }

      router.push('/admin/categorias');
      return {};
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.error} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Nombre" required htmlFor="name">
          <Input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
            defaultValue={initial.name}
            onChange={(e) => {
              if (autoSlugRef.current && slugRef.current) {
                slugRef.current.value = slugify(e.target.value);
              }
            }}
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug">
          <div className="flex items-center gap-2">
            <Input
              ref={slugRef}
              id="slug"
              name="slug"
              type="text"
              defaultValue={initial.slug}
              placeholder="se genera desde el nombre"
              readOnly
              aria-readonly="true"
              className="flex-1"
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  const nameInput = document.getElementById('name') as HTMLInputElement | null;
                  if (slugRef.current && nameInput) {
                    slugRef.current.value = slugify(nameInput.value);
                    autoSlugRef.current = true;
                  }
                }}
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

      <FormField label="Descripción" required htmlFor="description">
        <Textarea
          id="description"
          name="description"
          required
          aria-required="true"
          rows={3}
          defaultValue={initial.description}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Ocasión" htmlFor="occasion">
          <Input
            id="occasion"
            name="occasion"
            type="text"
            defaultValue={initial.occasion}
            placeholder="ej: cumpleaños, amor, condolencias"
          />
        </FormField>

        <FormField label="Imagen" htmlFor="imageUrl">
          <input type="hidden" name="imageUrl" value={imageUrl} />
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            folder="categorias"
          />
        </FormField>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" loading={isPending}>
          {isPending
            ? (isEditing ? 'Guardando…' : 'Creando…')
            : (isEditing ? 'Guardar cambios' : 'Crear categoría')}
        </Button>
        <Button variant="ghost" size="md" onClick={() => router.push('/admin/categorias')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
