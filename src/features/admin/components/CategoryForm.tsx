'use client';

import { useActionState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import type { CategoryFormData } from '@/features/admin/types';
import { createCategory, updateCategory } from '@/features/admin/actions/categories';
import { slugify } from '@/features/admin/utils/slugify';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface CategoryFormProps {
  category?: CategoryRow;
}

function rowToFormData(row: CategoryRow): Omit<CategoryFormData, 'displayOrder'> {
  return {
    name: row.name,
    slug: row.slug,
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
      {state.error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            color: 'var(--color-primary)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
          }}
        >
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initial.name}
            onChange={(e) => {
              if (slugRef.current && !isEditing) {
                slugRef.current.value = slugify(e.target.value);
              }
            }}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            Slug
          </label>
          <input
            ref={slugRef}
            id="slug"
            name="slug"
            type="text"
            defaultValue={initial.slug}
            placeholder="se genera automáticamente"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          Descripción *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={initial.description}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 resize-y"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-dark)',
            border: '1px solid var(--color-border)',
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="occasion" className="block text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            Ocasión
          </label>
          <input
            id="occasion"
            name="occasion"
            type="text"
            defaultValue={initial.occasion}
            placeholder="ej: cumpleaños, amor, condolencias"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="imageUrl" className="block text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            URL de imagen
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={initial.imageUrl}
            placeholder="https://res.cloudinary.com/..."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
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
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
          }}
        >
          {isPending
            ? (isEditing ? 'Guardando…' : 'Creando…')
            : (isEditing ? 'Guardar cambios' : 'Crear categoría')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categorias')}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-dark)',
            border: '1px solid var(--color-border)',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
