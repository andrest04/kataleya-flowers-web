'use client';

import { useState, useTransition } from 'react';
import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { PRODUCT_COLORS, PRODUCT_FLOWER_TYPES } from '@/features/catalog/types';
import { createProduct, updateProduct } from '@/features/admin/actions/products';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { FormField, FormError } from '@/components/ui/FormField';
import PillToggle from '@/components/ui/PillToggle';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface ProductFormProps {
  product?: ProductRow;
  categories: CategoryRow[];
  onSuccess?: () => void;
}

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

// ── main component ────────────────────────────────────────────────────────────

function makeKeys(length: number): string[] {
  return Array.from({ length }, () => crypto.randomUUID());
}

export default function ProductForm({ product, categories, onSuccess }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(buildInitialState(product));
  const [includeKeys, setIncludeKeys] = useState<string[]>(() =>
    makeKeys(product?.includes?.length ?? 0)
  );
  const [variantKeys, setVariantKeys] = useState<string[]>(() =>
    makeKeys(product?.price_variants?.length ?? 0)
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── helpers ────────────────────────────────────────────────────────────────

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
  }

  // ── dynamic list helpers ───────────────────────────────────────────────────

  function addInclude() {
    set('includes', [...form.includes, '']);
    setIncludeKeys((prev) => [...prev, crypto.randomUUID()]);
  }

  function updateInclude(i: number, val: string) {
    const next = [...form.includes];
    next[i] = val;
    set('includes', next);
  }

  function removeInclude(i: number) {
    set('includes', form.includes.filter((_, idx) => idx !== i));
    setIncludeKeys((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addPriceVariant() {
    const variants = form.priceVariants ?? [];
    set('priceVariants', [...variants, { label: '', price: 0 }]);
    setVariantKeys((prev) => [...prev, crypto.randomUUID()]);
  }

  function updateVariantField(i: number, field: 'label' | 'price', val: string) {
    const variants = [...(form.priceVariants ?? [])];
    variants[i] = {
      ...variants[i],
      [field]: field === 'price' ? Number(val) : val,
    };
    set('priceVariants', variants);
  }

  function removeVariant(i: number) {
    const variants = (form.priceVariants ?? []).filter((_, idx) => idx !== i);
    set('priceVariants', variants.length > 0 ? variants : null);
    setVariantKeys((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, form)
        : await createProduct(form);

      if (!result.success) {
        setError(result.error ?? 'Ocurrió un error al guardar.');
        return;
      }

      onSuccess?.();
      if (!product) {
        setForm(buildInitialState());
      }
    });
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 max-w-3xl">

      {/* Nombre + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre" required>
          <Input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Ramo de rosas rojas"
          />
        </FormField>
        <FormField label="Slug">
          <Input
            type="text"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="ramo-rosas-rojas (auto si vacío)"
          />
        </FormField>
      </div>

      {/* Descripción */}
      <FormField label="Descripción" required>
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          rows={3}
          placeholder="Descripción del producto…"
        />
      </FormField>

      {/* Categoría + Precio */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Categoría" required>
          <Select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            required
          >
            <option value="">Seleccioná una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Precio base (S/)" required>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => set('price', Number(e.target.value))}
            required
            min={0}
            step={0.01}
          />
        </FormField>
      </div>

      {/* Imagen principal */}
      <FormField label="URL imagen principal" required>
        <Input
          type="url"
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          required
          placeholder="https://res.cloudinary.com/…"
        />
      </FormField>

      {/* Colores */}
      <div>
        <FormField label="Colores">
          <div className="flex flex-wrap gap-2">
          {PRODUCT_COLORS.map((c) => {
            const selected = form.colors.includes(c.value);
            return (
              <PillToggle
                key={c.value}
                label={c.label}
                active={selected}
                onClick={() => set('colors', toggleArrayItem(form.colors, c.value))}
                activeColor="primary"
                icon={c.hex ? (
                  <span
                    className="w-3 h-3 rounded-full inline-block border"
                    style={{ background: c.hex, borderColor: 'var(--color-border)' }}
                  />
                ) : undefined}
              />
            );
          })}
          </div>
        </FormField>
      </div>

      {/* Tipos de flor */}
      <div>
        <FormField label="Tipos de flor">
          <div className="flex flex-wrap gap-2">
          {PRODUCT_FLOWER_TYPES.map((ft) => {
            const selected = form.flowerTypes.includes(ft);
            return (
              <PillToggle
                key={ft}
                label={ft}
                active={selected}
                onClick={() => set('flowerTypes', toggleArrayItem(form.flowerTypes, ft))}
                activeColor="accent"
                className="capitalize"
              />
            );
          })}
          </div>
        </FormField>
      </div>

      {/* Incluye */}
      <div>
        <FormField label="¿Qué incluye?">
          <div className="space-y-2">
          {form.includes.map((item, i) => (
            <div key={includeKeys[i]} className="flex gap-2">
              <Input
                type="text"
                value={item}
                onChange={(e) => updateInclude(i, e.target.value)}
                placeholder="ej. 24 rosas rojas"
                style={{ flex: 1 }}
              />
              <Button variant="destructive" size="sm" onClick={() => removeInclude(i)} className="px-2">
                ×
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addInclude}>
            + Agregar ítem
          </Button>
          </div>
        </FormField>
      </div>

      {/* Variantes de precio */}
      <div>
        <FormField label="Variantes de precio">
          <div className="space-y-2">
          {(form.priceVariants ?? []).map((v, i) => (
            <div key={variantKeys[i]} className="flex gap-2 items-center">
              <Input
                type="text"
                value={v.label}
                onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                placeholder="ej. 12 rosas"
                style={{ flex: 2 }}
              />
              <Input
                type="number"
                value={v.price}
                onChange={(e) => updateVariantField(i, 'price', e.target.value)}
                placeholder="Precio"
                min={0}
                step={0.01}
                style={{ flex: 1 }}
              />
              <Button variant="destructive" size="sm" onClick={() => removeVariant(i)} className="px-2">
                ×
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addPriceVariant}>
            + Agregar variante
          </Button>
          </div>
        </FormField>
      </div>

      {/* Ocasión + Nota */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ocasión">
          <Input
            type="text"
            value={form.occasion}
            onChange={(e) => set('occasion', e.target.value)}
            placeholder="ej. Perfecto para aniversarios"
          />
        </FormField>
        <FormField label="Nota">
          <Input
            type="text"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="ej. Incluye peluche"
          />
        </FormField>
      </div>

      {/* Orden de display */}
      <div className="w-40">
        <FormField label="Orden de display">
          <Input
            type="number"
            value={form.displayOrder}
            onChange={(e) => set('displayOrder', Number(e.target.value))}
            min={0}
          />
        </FormField>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-dark)' }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="w-4 h-4 accent-[var(--color-accent)]"
          />
          Activo
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-dark)' }}>
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => set('isFeatured', e.target.checked)}
            className="w-4 h-4 accent-[var(--color-secondary)]"
          />
          Destacado
        </label>
      </div>

      {/* Error */}
      <FormError message={error} />

      {/* Submit */}
      <div>
        <Button type="submit" variant="primary" size="md" loading={isPending}>
          {isPending
            ? 'Guardando…'
            : product
              ? 'Guardar producto'
              : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
