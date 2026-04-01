'use client';

import { useState, useTransition } from 'react';
import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { PRODUCT_COLORS, PRODUCT_FLOWER_TYPES } from '@/features/catalog/types';
import { createProduct, updateProduct } from '@/features/admin/actions/products';

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

// ── small sub-components ──────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      className="block text-xs font-semibold mb-1"
      style={{ color: 'var(--color-dark)' }}
    >
      {children}
      {required && <span style={{ color: 'var(--color-primary)' }}> *</span>}
    </label>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-white)',
  color: 'var(--color-dark)',
  fontSize: '14px',
  outline: 'none',
};

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
        <div>
          <FieldLabel required>Nombre</FieldLabel>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Ramo de rosas rojas"
            style={inputBase}
          />
        </div>
        <div>
          <FieldLabel>Slug</FieldLabel>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="ramo-rosas-rojas (auto si vacío)"
            style={inputBase}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <FieldLabel required>Descripción</FieldLabel>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          rows={3}
          placeholder="Descripción del producto…"
          style={{ ...inputBase, resize: 'vertical' }}
        />
      </div>

      {/* Categoría + Precio */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Categoría</FieldLabel>
          <select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            required
            style={inputBase}
          >
            <option value="">Seleccioná una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel required>Precio base (S/)</FieldLabel>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', Number(e.target.value))}
            required
            min={0}
            step={0.01}
            style={inputBase}
          />
        </div>
      </div>

      {/* Imagen principal */}
      <div>
        <FieldLabel required>URL imagen principal</FieldLabel>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          required
          placeholder="https://res.cloudinary.com/…"
          style={inputBase}
        />
      </div>

      {/* Colores */}
      <div>
        <FieldLabel>Colores</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRODUCT_COLORS.map((c) => {
            const selected = form.colors.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => set('colors', toggleArrayItem(form.colors, c.value))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selected
                    ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                    : 'var(--color-white)',
                  color: selected ? 'var(--color-primary)' : 'var(--color-dark)',
                }}
              >
                {c.hex && (
                  <span
                    className="w-3 h-3 rounded-full inline-block border"
                    style={{
                      background: c.hex,
                      borderColor: 'var(--color-border)',
                    }}
                  />
                )}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipos de flor */}
      <div>
        <FieldLabel>Tipos de flor</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRODUCT_FLOWER_TYPES.map((ft) => {
            const selected = form.flowerTypes.includes(ft);
            return (
              <button
                key={ft}
                type="button"
                onClick={() => set('flowerTypes', toggleArrayItem(form.flowerTypes, ft))}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                style={{
                  border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: selected
                    ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                    : 'var(--color-white)',
                  color: selected ? 'var(--color-accent)' : 'var(--color-dark)',
                }}
              >
                {ft}
              </button>
            );
          })}
        </div>
      </div>

      {/* Incluye */}
      <div>
        <FieldLabel>¿Qué incluye?</FieldLabel>
        <div className="space-y-2 mt-1">
          {form.includes.map((item, i) => (
            <div key={includeKeys[i]} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateInclude(i, e.target.value)}
                placeholder="ej. 24 rosas rojas"
                style={{ ...inputBase, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeInclude(i)}
                className="px-2 rounded-lg text-sm hover:opacity-70 transition-opacity"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInclude}
            className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          >
            + Agregar ítem
          </button>
        </div>
      </div>

      {/* Variantes de precio */}
      <div>
        <FieldLabel>Variantes de precio</FieldLabel>
        <div className="space-y-2 mt-1">
          {(form.priceVariants ?? []).map((v, i) => (
            <div key={variantKeys[i]} className="flex gap-2 items-center">
              <input
                type="text"
                value={v.label}
                onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                placeholder="ej. 12 rosas"
                style={{ ...inputBase, flex: 2 }}
              />
              <input
                type="number"
                value={v.price}
                onChange={(e) => updateVariantField(i, 'price', e.target.value)}
                placeholder="Precio"
                min={0}
                step={0.01}
                style={{ ...inputBase, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="px-2 rounded-lg text-sm hover:opacity-70 transition-opacity"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPriceVariant}
            className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-dark)',
              border: '1px solid var(--color-border)',
            }}
          >
            + Agregar variante
          </button>
        </div>
      </div>

      {/* Ocasión + Nota */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Ocasión</FieldLabel>
          <input
            type="text"
            value={form.occasion}
            onChange={(e) => set('occasion', e.target.value)}
            placeholder="ej. Perfecto para aniversarios"
            style={inputBase}
          />
        </div>
        <div>
          <FieldLabel>Nota</FieldLabel>
          <input
            type="text"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="ej. Incluye peluche"
            style={inputBase}
          />
        </div>
      </div>

      {/* Orden de display */}
      <div className="w-40">
        <FieldLabel>Orden de display</FieldLabel>
        <input
          type="number"
          value={form.displayOrder}
          onChange={(e) => set('displayOrder', Number(e.target.value))}
          min={0}
          style={inputBase}
        />
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
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            color: 'var(--color-primary)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
          }}
        >
          {isPending
            ? 'Guardando…'
            : product
              ? 'Guardar producto'
              : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}
