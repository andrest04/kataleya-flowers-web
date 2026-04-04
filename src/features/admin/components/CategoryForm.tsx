'use client';

import { useActionState, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import type { CategoryFormData } from '@/features/admin/types';
import { createCategory, updateCategory } from '@/features/admin/actions/categories';
import { slugify } from '@/features/admin/utils/slugify';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { FormField, FormError } from '@/components/ui/FormField';
import ImageUploader from '@/features/admin/components/ImageUploader';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface CategoryFormProps {
  category?: CategoryRow;
}

function rowToFormData(row: CategoryRow): Omit<CategoryFormData, 'displayOrder'> {
  return {
    name: row.name,
    slug: slugify(row.name),
    description: row.description,
    occasion: row.occasion ?? '',
    imageUrl: row.image_url ?? '',
    isActive: row.is_active,
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
    : { name: '', slug: '', description: '', occasion: '', imageUrl: '', isActive: true };
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);

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
            defaultValue={initial.name}
            onChange={(e) => {
              if (slugRef.current) {
                slugRef.current.value = slugify(e.target.value);
              }
            }}
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug">
          <Input
            ref={slugRef}
            id="slug"
            name="slug"
            type="text"
            defaultValue={slugify(initial.name)}
            placeholder="se genera desde el nombre"
            readOnly
          />
        </FormField>
      </div>

      <FormField label="Descripción" required htmlFor="description">
        <Textarea
          id="description"
          name="description"
          required
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

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={initial.isActive}
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--color-accent)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            Categoría activa
          </span>
        </label>
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
