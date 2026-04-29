'use server';

import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/types';
import type { CategoryFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import { destroyCloudinaryImage, destroyCloudinaryImages } from '@/lib/cloudinary';
import {
  type AdminActionFailure,
  type AdminSupabaseClient,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { isAllowedCloudinaryUrl } from '@/features/admin/utils/cloudinaryUrl';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from '@/features/admin/schemas/category';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import { uuid } from '@/features/admin/schemas/common';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

interface SuccessResult {
  success: true;
}
type CategoryActionResult = SuccessResult | AdminActionFailure;

interface CountSuccess {
  count: number;
}
type CountResult = CountSuccess | (AdminActionFailure & { count: 0 });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toInsertPayload(data: CategoryFormData, slug: string): CategoryInsert {
  return {
    name: data.name,
    slug,
    description: data.description,
    occasion: data.occasion || null,
    image_url: data.imageUrl || null,
    display_order: data.displayOrder,
    is_active: data.isActive,
    is_featured: data.isFeatured,
  };
}

async function revalidateAllCategoryPaths(
  supabase: AdminSupabaseClient,
  affectedSlugs?: string[],
): Promise<void> {
  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin/categorias');
  revalidatePath('/admin/productos');

  // Si conocemos el slug afectado lo revalidamos puntualmente —
  // si no, traemos todas las activas y las revalidamos para cubrir cambios bulk
  // como reorder o cambios masivos.
  let slugs: string[] = affectedSlugs ?? [];
  if (slugs.length === 0) {
    const { data } = await supabase.from('categories').select('slug');
    slugs = (data ?? []).map((row) => row.slug);
  }
  for (const slug of slugs) {
    if (slug) revalidatePath(`/catalogo/${slug}`);
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createCategory(
  data: CategoryFormData,
): Promise<CategoryActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = categoryCreateSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[createCategory] validation failed:', parsed.error.issues);
      return {
        success: false,
        error: 'Datos inválidos. Revisá el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (parsed.data.imageUrl && !isAllowedCloudinaryUrl(parsed.data.imageUrl)) {
      return {
        success: false,
        error: 'URL de imagen no permitida.',
        code: 'VALIDATION',
      };
    }

    const { supabase } = ctx;

    // Auto-assign next display order
    const { data: all } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = all && all.length > 0 ? all[0].display_order + 1 : 1;

    const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
    const payload = toInsertPayload(
      { ...(parsed.data as CategoryFormData), displayOrder: nextOrder },
      slug,
    );

    const { error } = await supabase.from('categories').insert(payload);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    await revalidateAllCategoryPaths(supabase, [slug]);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateCategory(
  id: string,
  data: CategoryFormData,
): Promise<CategoryActionResult> {
  try {
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }

    const parsed = categoryUpdateSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[updateCategory] validation failed:', parsed.error.issues);
      return {
        success: false,
        error: 'Datos inválidos. Revisá el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    if (parsed.data.imageUrl && !isAllowedCloudinaryUrl(parsed.data.imageUrl)) {
      return {
        success: false,
        error: 'URL de imagen no permitida.',
        code: 'VALIDATION',
      };
    }

    const { supabase } = ctx;

    // Fetch current image + slug to detect replacement
    const { data: current } = await supabase
      .from('categories')
      .select('image_url, slug')
      .eq('id', idParsed.data)
      .single();

    const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
    const payload = toInsertPayload(parsed.data as CategoryFormData, slug);

    const { error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    // Cleanup replaced image from Cloudinary (best-effort)
    if (current?.image_url && current.image_url !== parsed.data.imageUrl) {
      void destroyCloudinaryImage(current.image_url);
    }

    const affected = [current?.slug, slug].filter(
      (value): value is string => typeof value === 'string',
    );
    await revalidateAllCategoryPaths(supabase, affected);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<CategoryActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = reorderSchema.safeParse({ ids: orderedIds });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Lista de identificadores inválida.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { supabase } = ctx;

    const { error } = await supabase.rpc('reorder_categories', {
      p_ordered_ids: parsed.data.ids,
    });

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    await revalidateAllCategoryPaths(supabase);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function getCategoryProductCount(
  categoryId: string,
): Promise<CountResult> {
  try {
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(categoryId);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
        count: 0,
      };
    }

    const { supabase } = ctx;

    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
        count: 0,
      };
    }
    return { count: count ?? 0 };
  } catch (err) {
    const failure = failureFromUnknown(err);
    return { ...failure, count: 0 };
  }
}

export async function deleteCategory(
  id: string,
  mode: 'reassign' | 'cascade',
  reassignTo?: string,
): Promise<CategoryActionResult> {
  try {
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (mode !== 'reassign' && mode !== 'cascade') {
      return {
        success: false,
        error: 'Modo de eliminación inválido.',
        code: 'VALIDATION',
      };
    }

    const { supabase } = ctx;

    if (mode === 'cascade') {
      const { data: imageUrls, error } = await supabase.rpc(
        'delete_category_cascade',
        { p_category_id: idParsed.data },
      );

      if (error) {
        return {
          success: false,
          error: describeSupabaseError(error),
          code: 'INTERNAL',
        };
      }

      if (imageUrls?.length) void destroyCloudinaryImages(imageUrls);
    } else {
      const reassignParsed = uuid.safeParse(reassignTo);
      if (!reassignParsed.success) {
        return {
          success: false,
          error:
            'Seleccioná una categoría destino válida para reasignar los productos.',
          code: 'VALIDATION',
        };
      }

      const { data: imageUrl, error } = await supabase.rpc(
        'delete_category_reassign',
        {
          p_category_id: idParsed.data,
          p_reassign_to: reassignParsed.data,
        },
      );

      if (error) {
        return {
          success: false,
          error: describeSupabaseError(error),
          code: 'INTERNAL',
        };
      }

      if (imageUrl) void destroyCloudinaryImage(imageUrl);
    }

    await revalidateAllCategoryPaths(supabase);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean,
): Promise<CategoryActionResult> {
  try {
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (typeof isActive !== 'boolean') {
      return {
        success: false,
        error: 'Estado inválido.',
        code: 'VALIDATION',
      };
    }

    const { supabase } = ctx;

    const { data: row } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', idParsed.data)
      .single();

    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    await revalidateAllCategoryPaths(supabase, row?.slug ? [row.slug] : undefined);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleCategoryFeatured(
  id: string,
  isFeatured: boolean,
): Promise<CategoryActionResult> {
  try {
    const ctx = await requireAdmin();

    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return {
        success: false,
        error: 'Identificador inválido.',
        code: 'VALIDATION',
        issues: idParsed.error.issues,
      };
    }
    if (typeof isFeatured !== 'boolean') {
      return {
        success: false,
        error: 'Estado inválido.',
        code: 'VALIDATION',
      };
    }

    const { supabase } = ctx;

    const { data: row } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', idParsed.data)
      .single();

    const { error } = await supabase
      .from('categories')
      .update({ is_featured: isFeatured })
      .eq('id', idParsed.data);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    await revalidateAllCategoryPaths(supabase, row?.slug ? [row.slug] : undefined);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
