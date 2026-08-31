'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { createProduct, updateProduct } from '@/features/admin/actions/products';
import type { AdminProductRow } from '@/features/admin/queries/products';
import type { ProductFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import type { PriceVariantRow } from '@/features/catalog/types';
import type { ProductRow } from '@/lib/db/rows';

import { buildFieldErrors, type FieldErrors } from './validation';

type ProductInput = ProductRow | AdminProductRow;

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
  setField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
  setName: (name: string) => void;
  regenerateSlug: () => void;
  isEditing: boolean;
  toggleArrayItem: <K extends 'colors' | 'flowerTypes'>(key: K, item: string) => void;
  addPendingFlowerType: (name: string) => void;
  addPendingColor: (color: { name: string; hex: string }) => void;
  renameInForm: <K extends 'colors' | 'flowerTypes'>(key: K, oldName: string, newName: string) => void;
  removeFromForm: <K extends 'colors' | 'flowerTypes'>(key: K, item: string) => void;
  addInclude: () => void;
  updateInclude: (i: number, val: string) => void;
  removeInclude: (i: number) => void;
  addPriceVariant: () => void;
  updateVariantField: (i: number, field: 'label' | 'price', val: string) => void;
  removeVariant: (i: number) => void;
  submit: () => void;
  reportTransientError: (msg: string) => void;
}

interface UseProductFormParams {
  product?: ProductInput;
  onSuccess?: () => void;
  initialCategoryId?: string;
  successHref?: string;
}

function buildInitialState(product?: ProductInput, initialCategoryId?: string): ProductFormData {
  if (!product) {
    return {
      name: '',
      slug: '',
      description: '',
      price: 0,
      categoryId: initialCategoryId ?? '',
      imageUrl: '',
      images: [],
      imageAlts: {},
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

  const relational = product as AdminProductRow;

  const colors: string[] = relational.product_color_assignments
    ? relational.product_color_assignments
        .map((a) => a.product_colors?.name)
        .filter((n): n is string => !!n)
    : (product.colors ?? []);

  const flowerTypes: string[] = relational.product_flower_type_assignments
    ? relational.product_flower_type_assignments
        .map((a) => a.flower_types?.name)
        .filter((n): n is string => !!n)
    : (product.flower_types ?? []);

  const sortedImages = relational.product_images
    ? [...relational.product_images].sort((a, b) => a.display_order - b.display_order)
    : null;

  const primaryImg = sortedImages?.find((i) => i.is_primary) ?? sortedImages?.[0];
  const imageUrl = primaryImg?.url ?? product.image_url ?? '';
  const galleryImages = sortedImages
    ? sortedImages.map((i) => i.url)
    : (product.images ?? []);
  const imageAlts = sortedImages
    ? Object.fromEntries(
        sortedImages
          .filter((image) => image.alt_text && image.alt_text !== product.name)
          .map((image) => [image.url, image.alt_text as string]),
      )
    : {};

  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    categoryId: product.category_id,
    imageUrl,
    images: galleryImages,
    imageAlts,
    colors,
    flowerTypes,
    includes: (product.includes as unknown as string[]) ?? [],
    priceVariants: (product.price_variants as unknown as PriceVariantRow[] | null) ?? null,
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

export function useProductForm({
  product,
  onSuccess,
  initialCategoryId,
  successHref,
}: UseProductFormParams): ProductFormState & ProductFormApi {
  const router = useRouter();
  const isEditing = Boolean(product);

  const [form, setForm] = useState<ProductFormData>(() => buildInitialState(product, initialCategoryId));
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [includeKeys, setIncludeKeys] = useState<string[]>(() =>
    makeKeys((product?.includes as unknown as string[] | null | undefined)?.length ?? 0),
  );
  const [variantKeys, setVariantKeys] = useState<string[]>(() =>
    makeKeys((product?.price_variants as unknown as unknown[] | null | undefined)?.length ?? 0),
  );

  const [pendingNewTypes, setPendingNewTypes] = useState<string[]>([]);
  const [pendingNewColors, setPendingNewColors] = useState<{ name: string; hex: string }[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

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
        } else {
          setError(result.error || 'Ocurrió un error al guardar.');
        }
        return;
      }

      setPendingNewTypes([]);
      setPendingNewColors([]);
      onSuccess?.();
      router.push(successHref ?? '/admin/categorias');
    });
  }, [form, pendingNewTypes, pendingNewColors, product, onSuccess, router, successHref]);

  const reportTransientError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  return {
    form,
    includeKeys,
    variantKeys,
    pendingNewTypes,
    pendingNewColors,
    error,
    fieldErrors,
    isPending,
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
