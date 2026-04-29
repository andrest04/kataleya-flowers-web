'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { createProduct, updateProduct } from '@/features/admin/actions/products';
import type { ProductFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import type { Database } from '@/lib/supabase/types';

import { buildFieldErrors, type FieldErrors } from './validation';

type ProductRow = Database['public']['Tables']['products']['Row'];

// ─── Tipos públicos del hook ────────────────────────────────────────────────

export interface ProductFormState {
  form: ProductFormData;
  includeKeys: string[];
  variantKeys: string[];
  pendingNewTypes: string[];
  pendingNewColors: { name: string; hex: string }[];
  error: string | null;
  fieldErrors: FieldErrors;
  isPending: boolean;
}

export interface ProductFormApi {
  /** Actualiza un campo simple del form. */
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
  /**
   * Cambia el `name`. En modo create, el slug se deriva automáticamente.
   * En modo edit, el slug se preserva (no rompemos URLs indexadas).
   */
  setName: (name: string) => void;
  /** Regenera el slug desde el `name` actual. Solo se ofrece en modo edit. */
  regenerateSlug: () => void;
  /** True cuando el form está en modo edit (hay un product). */
  isEditing: boolean;
  /** Toggle declarativo para arrays de strings (colores, flowerTypes). */
  toggleArrayItem: <K extends 'colors' | 'flowerTypes'>(key: K, item: string) => void;
  /** Pendientes de nuevos tipos/colores que viajan al server action. */
  addPendingFlowerType: (name: string) => void;
  addPendingColor: (color: { name: string; hex: string }) => void;
  /** Lo dispara el TaxonomyManager cuando un rename del backend tiene éxito. */
  renameInForm: <K extends 'colors' | 'flowerTypes'>(key: K, oldName: string, newName: string) => void;
  removeFromForm: <K extends 'colors' | 'flowerTypes'>(key: K, item: string) => void;
  /** Includes (lista dinámica). */
  addInclude: () => void;
  updateInclude: (i: number, val: string) => void;
  removeInclude: (i: number) => void;
  /** Price variants (lista dinámica). */
  addPriceVariant: () => void;
  updateVariantField: (i: number, field: 'label' | 'price', val: string) => void;
  removeVariant: (i: number) => void;
  /** Flujo de submit. Devuelve void; el hook maneja el resultado internamente. */
  submit: () => void;
  /**
   * Reporta un error transitorio (ej: fallo de rename/delete de una taxonomía)
   * en el banner de error global, sin tocar `fieldErrors`.
   */
  reportTransientError: (msg: string) => void;
}

interface UseProductFormParams {
  product?: ProductRow;
  onSuccess?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildInitialState(product?: ProductRow): ProductFormData {
  if (!product) {
    return {
      name: '',
      slug: '',
      description: '',
      price: 0,
      categoryId: '',
      imageUrl: '',
      images: [],
      colors: [],
      flowerTypes: [],
      includes: [],
      priceVariants: null,
      occasion: '',
      note: '',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
    };
  }
  return {
    name: product.name,
    // SEO: preservar el slug existente en edit. Cambiar el name no regenera el slug
    // (rompería URLs ya indexadas). El user puede regenerar a propósito.
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    categoryId: product.category_id,
    imageUrl: product.image_url,
    images: product.images ?? [],
    colors: product.colors ?? [],
    flowerTypes: product.flower_types ?? [],
    includes: (product.includes as string[]) ?? [],
    priceVariants: product.price_variants ?? null,
    occasion: product.occasion ?? '',
    note: product.note ?? '',
    isActive: product.is_active,
    isFeatured: product.is_featured,
    displayOrder: product.display_order,
  };
}

function makeKeys(length: number): string[] {
  return Array.from({ length }, () => crypto.randomUUID());
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useProductForm({
  product,
  onSuccess,
}: UseProductFormParams): ProductFormState & ProductFormApi {
  const router = useRouter();
  const isEditing = Boolean(product);

  const [form, setForm] = useState<ProductFormData>(() => buildInitialState(product));
  // En create el slug se deriva del name; en edit no se toca a menos que el user lo regenere.
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [includeKeys, setIncludeKeys] = useState<string[]>(() =>
    makeKeys(product?.includes?.length ?? 0),
  );
  const [variantKeys, setVariantKeys] = useState<string[]>(() =>
    makeKeys(product?.price_variants?.length ?? 0),
  );

  const [pendingNewTypes, setPendingNewTypes] = useState<string[]>([]);
  const [pendingNewColors, setPendingNewColors] = useState<{ name: string; hex: string }[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  // ── Setters básicos ────────────────────────────────────────────────────────

  const setField = useCallback(
    <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setName = useCallback(
    (name: string) => {
      setForm((prev) => ({
        ...prev,
        name,
        // Solo derivamos el slug si autoSlug está activo (create, o edit con regenerar pedido).
        slug: autoSlug ? slugify(name) : prev.slug,
      }));
    },
    [autoSlug],
  );

  const regenerateSlug = useCallback(() => {
    setAutoSlug(true);
    setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, []);

  const toggleArrayItem = useCallback(
    <K extends 'colors' | 'flowerTypes'>(key: K, item: string) => {
      setForm((prev) => {
        const arr = prev[key];
        const next = arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  // ── Pendientes de creación ─────────────────────────────────────────────────

  const addPendingFlowerType = useCallback((name: string) => {
    setPendingNewTypes((prev) => [...prev, name]);
    setForm((prev) => ({ ...prev, flowerTypes: [...prev.flowerTypes, name] }));
  }, []);

  const addPendingColor = useCallback((color: { name: string; hex: string }) => {
    setPendingNewColors((prev) => [...prev, color]);
    setForm((prev) => ({ ...prev, colors: [...prev.colors, color.name] }));
  }, []);

  const renameInForm = useCallback(
    <K extends 'colors' | 'flowerTypes'>(key: K, oldName: string, newName: string) => {
      setForm((prev) => {
        const arr = prev[key];
        if (!arr.includes(oldName)) return prev;
        return { ...prev, [key]: arr.map((t) => (t === oldName ? newName : t)) };
      });
    },
    [],
  );

  const removeFromForm = useCallback(
    <K extends 'colors' | 'flowerTypes'>(key: K, item: string) => {
      setForm((prev) => ({ ...prev, [key]: prev[key].filter((t) => t !== item) }));
    },
    [],
  );

  // ── Includes ───────────────────────────────────────────────────────────────

  const addInclude = useCallback(() => {
    setForm((prev) => ({ ...prev, includes: [...prev.includes, ''] }));
    setIncludeKeys((prev) => [...prev, crypto.randomUUID()]);
  }, []);

  const updateInclude = useCallback((i: number, val: string) => {
    setForm((prev) => {
      const next = [...prev.includes];
      next[i] = val;
      return { ...prev, includes: next };
    });
  }, []);

  const removeInclude = useCallback((i: number) => {
    setForm((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, idx) => idx !== i),
    }));
    setIncludeKeys((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  // ── Price variants ─────────────────────────────────────────────────────────

  const addPriceVariant = useCallback(() => {
    setForm((prev) => {
      const variants = prev.priceVariants ?? [];
      return { ...prev, priceVariants: [...variants, { label: '', price: 0 }] };
    });
    setVariantKeys((prev) => [...prev, crypto.randomUUID()]);
  }, []);

  const updateVariantField = useCallback(
    (i: number, field: 'label' | 'price', val: string) => {
      setForm((prev) => {
        const variants = [...(prev.priceVariants ?? [])];
        variants[i] = {
          ...variants[i],
          [field]: field === 'price' ? Number(val) : val,
        };
        return { ...prev, priceVariants: variants };
      });
    },
    [],
  );

  const removeVariant = useCallback((i: number) => {
    setForm((prev) => {
      const variants = (prev.priceVariants ?? []).filter((_, idx) => idx !== i);
      return { ...prev, priceVariants: variants.length > 0 ? variants : null };
    });
    setVariantKeys((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submit = useCallback(() => {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload: ProductFormData = {
        ...form,
        newFlowerTypes: pendingNewTypes,
        newColors: pendingNewColors,
      };
      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (!result.success) {
        if (result.code === 'VALIDATION' && result.issues) {
          setFieldErrors(buildFieldErrors(result.issues));
        }
        setError(result.error || 'Ocurrió un error al guardar.');
        return;
      }

      setPendingNewTypes([]);
      setPendingNewColors([]);
      onSuccess?.();
      router.push('/admin/productos');
    });
  }, [form, pendingNewTypes, pendingNewColors, product, onSuccess, router]);

  const reportTransientError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  return {
    // state
    form,
    includeKeys,
    variantKeys,
    pendingNewTypes,
    pendingNewColors,
    error,
    fieldErrors,
    isPending,
    // api
    setField,
    setName,
    regenerateSlug,
    isEditing,
    toggleArrayItem,
    addPendingFlowerType,
    addPendingColor,
    renameInForm,
    removeFromForm,
    addInclude,
    updateInclude,
    removeInclude,
    addPriceVariant,
    updateVariantField,
    removeVariant,
    submit,
    reportTransientError,
  };
}
