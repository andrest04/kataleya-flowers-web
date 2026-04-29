'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import type { ProductFormData } from '@/features/admin/types';
import { slugify } from '@/features/admin/utils/slugify';
import { createProduct, updateProduct } from '@/features/admin/actions/products';
import { deleteFlowerType, renameFlowerType } from '@/features/admin/actions/flowerTypes';
import { deleteProductColor, renameProductColor } from '@/features/admin/actions/productColors';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { FormField, FormError } from '@/components/ui/FormField';
import PillToggle from '@/components/ui/PillToggle';
import ImageUploader from '@/features/admin/components/ImageUploader';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface FlowerTypeOption {
  id: string;
  name: string;
}

interface ColorOption {
  id: string;
  name: string;
  label: string;
  hex: string | null;
}

interface ProductFormProps {
  product?: ProductRow;
  categories: CategoryRow[];
  flowerTypes: FlowerTypeOption[];
  productColors: ColorOption[];
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
    slug: slugify(product.name),
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

export default function ProductForm({ product, categories, flowerTypes, productColors, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(buildInitialState(product));
  const [includeKeys, setIncludeKeys] = useState<string[]>(() =>
    makeKeys(product?.includes?.length ?? 0)
  );
  const [variantKeys, setVariantKeys] = useState<string[]>(() =>
    makeKeys(product?.price_variants?.length ?? 0)
  );
  // Flower type management state
  const [pendingNewTypes, setPendingNewTypes] = useState<string[]>([]);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const newTypeInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [manageFlowerTypes, setManageFlowerTypes] = useState(false);
  const [renamingType, setRenamingType] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingType, setDeletingType] = useState<string | null>(null);
  const [deleteUsageCount, setDeleteUsageCount] = useState<number | null>(null);
  // Color management state
  const [pendingNewColors, setPendingNewColors] = useState<{ name: string; hex: string }[]>([]);
  const [newColorInput, setNewColorInput] = useState('');
  const [newColorHex, setNewColorHex] = useState('#3b82f6');
  const [showNewColorInput, setShowNewColorInput] = useState(false);
  const newColorInputRef = useRef<HTMLInputElement>(null);
  const renameColorInputRef = useRef<HTMLInputElement>(null);
  const [manageColors, setManageColors] = useState(false);
  const [renamingColor, setRenamingColor] = useState<string | null>(null);
  const [renameColorValue, setRenameColorValue] = useState('');
  const [deletingColor, setDeletingColor] = useState<string | null>(null);
  const [deleteColorUsageCount, setDeleteColorUsageCount] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (showNewTypeInput) newTypeInputRef.current?.focus();
  }, [showNewTypeInput]);

  useEffect(() => {
    if (renamingType) renameInputRef.current?.focus();
  }, [renamingType]);

  useEffect(() => {
    if (showNewColorInput) newColorInputRef.current?.focus();
  }, [showNewColorInput]);

  useEffect(() => {
    if (renamingColor) renameColorInputRef.current?.focus();
  }, [renamingColor]);

  const dbFlowerTypeNames = flowerTypes.map((ft) => ft.name);
  const allFlowerTypes = [
    ...dbFlowerTypeNames,
    ...pendingNewTypes.filter((t) => !dbFlowerTypeNames.includes(t)),
  ];

  const dbColorNames = productColors.map((c) => c.name);
  const allColors: ColorOption[] = [
    ...productColors,
    ...pendingNewColors
      .filter((pc) => !dbColorNames.includes(pc.name))
      .map((pc) => ({ id: pc.name, name: pc.name, label: pc.name.charAt(0).toUpperCase() + pc.name.slice(1), hex: pc.hex })),
  ];

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
      const payload = { ...form, newFlowerTypes: pendingNewTypes, newColors: pendingNewColors };
      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (!result.success) {
        setError(result.error ?? 'Ocurrió un error al guardar.');
        return;
      }

      setPendingNewTypes([]);
      setPendingNewColors([]);
      onSuccess?.();
      router.push('/admin/productos');
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
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({
                ...prev,
                name,
                slug: slugify(name),
              }));
            }}
            required
            placeholder="Ramo de rosas rojas"
          />
        </FormField>
        <FormField label="Slug">
          <Input
            type="text"
            value={form.slug}
            placeholder="se genera desde el nombre"
            readOnly
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
      <FormField label="Imagen principal" required>
        <ImageUploader
          value={form.imageUrl}
          onChange={(url) => set('imageUrl', url)}
          folder="productos"
        />
      </FormField>

      {/* Imágenes adicionales */}
      <FormField label="Imágenes adicionales">
        <ImageUploader
          multiple
          value={form.images}
          onChange={(urls) => set('images', urls)}
          folder="productos"
        />
      </FormField>

      {/* Colores */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <FormField label="Colores">
            <></>
          </FormField>
          <button
            type="button"
            onClick={() => { setManageColors((v) => !v); setRenamingColor(null); setDeletingColor(null); }}
            className="text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-muted)' }}
          >
            {manageColors ? 'Listo' : 'Gestionar'}
          </button>
        </div>
        <div>
          <div className="flex flex-wrap gap-2 items-center">
          {allColors.map((c) => {
            const selected = form.colors.includes(c.name);
            const isPendingColor = pendingNewColors.some((pc) => pc.name === c.name);

            if (manageColors && !isPendingColor) {
              if (renamingColor === c.name) {
                return (
                  <div key={c.name} className="flex items-center gap-1">
                    <input
                      ref={renameColorInputRef}
                      type="text"
                      value={renameColorValue}
                      onChange={(e) => setRenameColorValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newName = renameColorValue.toLowerCase().trim();
                          if (newName && newName !== c.name && !allColors.some((co) => co.name === newName)) {
                            startTransition(async () => {
                              const result = await renameProductColor(c.name, newName);
                              if (result.success) {
                                if (form.colors.includes(c.name)) {
                                  set('colors', form.colors.map((t) => t === c.name ? newName : t));
                                }
                                setRenamingColor(null);
                              } else {
                                setError(result.error ?? 'Error al renombrar');
                              }
                            });
                          }
                        }
                        if (e.key === 'Escape') setRenamingColor(null);
                      }}
                      className="rounded-full px-3 py-1 text-sm border outline-none focus:ring-1"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-dark)',
                        background: 'var(--color-white)',
                        width: '130px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setRenamingColor(null)}
                      className="text-xs"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      ×
                    </button>
                  </div>
                );
              }

              if (deletingColor === c.name) {
                return (
                  <div
                    key={c.name}
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-sm border"
                    style={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-white))',
                    }}
                  >
                    <span className="capitalize">{c.label}</span>
                    {deleteColorUsageCount !== null && deleteColorUsageCount > 0 && (
                      <span className="text-xs">({deleteColorUsageCount} producto{deleteColorUsageCount !== 1 ? 's' : ''})</span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await deleteProductColor(c.name);
                          if (result.success) {
                            set('colors', form.colors.filter((t) => t !== c.name));
                            setDeletingColor(null);
                            setDeleteColorUsageCount(null);
                          } else {
                            setError(result.error ?? 'Error al eliminar');
                          }
                        });
                      }}
                      className="text-xs font-medium underline"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeletingColor(null); setDeleteColorUsageCount(null); }}
                      className="text-xs"
                    >
                      ×
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={c.name}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-dark)',
                    background: selected ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-white))' : 'var(--color-surface)',
                  }}
                >
                  {c.hex && (
                    <span
                      className="w-3 h-3 rounded-full inline-block border"
                      style={{ background: c.hex, borderColor: 'var(--color-border)' }}
                    />
                  )}
                  <span>{c.label}</span>
                  <button
                    type="button"
                    onClick={() => { setRenamingColor(c.name); setRenameColorValue(c.name); setDeletingColor(null); }}
                    className="text-xs transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-muted)' }}
                    title="Renombrar"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingColor(c.name);
                      setRenamingColor(null);
                      setDeleteColorUsageCount(null);
                      void (async () => {
                        try {
                          const res = await fetch(
                            `/api/admin/product-color-usage?name=${encodeURIComponent(c.name)}`,
                          );
                          const data = (await res.json()) as { products: { product_id: string }[] };
                          setDeleteColorUsageCount(data.products.length);
                        } catch {
                          setDeleteColorUsageCount(0);
                        }
                      })();
                    }}
                    className="text-xs transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-primary)' }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              );
            }

            return (
              <PillToggle
                key={c.name}
                label={c.label}
                active={selected}
                onClick={() => set('colors', toggleArrayItem(form.colors, c.name))}
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
          {showNewColorInput ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const name = newColorInput.toLowerCase().trim();
                      if (name && !allColors.some((co) => co.name === name)) {
                        setPendingNewColors((prev) => [...prev, { name, hex: newColorHex }]);
                        set('colors', [...form.colors, name]);
                        setNewColorInput('');
                        setNewColorHex('#3b82f6');
                        setShowNewColorInput(false);
                      }
                    }
                    if (e.key === 'Escape') {
                      setNewColorInput('');
                      setShowNewColorInput(false);
                    }
                  }}
                  ref={newColorInputRef}
                  placeholder="nombre del color..."
                  className="rounded-full px-3 py-1.5 text-sm border outline-none focus:ring-1"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-dark)',
                    background: 'var(--color-white)',
                    width: '150px',
                  }}
                />
                <label
                  className="w-7 h-7 rounded-full border cursor-pointer block shrink-0 overflow-hidden"
                  style={{ borderColor: 'var(--color-border)', background: newColorHex }}
                  title="Elegir color"
                >
                  <span className="sr-only">Elegir color</span>
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="opacity-0 w-0 h-0 absolute"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const name = newColorInput.toLowerCase().trim();
                    if (name && !allColors.some((co) => co.name === name)) {
                      setPendingNewColors((prev) => [...prev, { name, hex: newColorHex }]);
                      set('colors', [...form.colors, name]);
                      setNewColorInput('');
                      setNewColorHex('#3b82f6');
                      setShowNewColorInput(false);
                    }
                  }}
                  className="rounded-full px-3 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
                  style={{
                    color: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)',
                  }}
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => { setNewColorInput(''); setShowNewColorInput(false); }}
                  className="rounded-full px-2 py-1.5 text-sm transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewColorInput(true)}
              className="rounded-full px-3 py-1 text-sm border border-dashed transition-colors hover:opacity-70"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              + Nuevo color
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Tipos de flor */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <FormField label="Tipos de flor">
            <></>
          </FormField>
          <button
            type="button"
            onClick={() => { setManageFlowerTypes((v) => !v); setRenamingType(null); setDeletingType(null); }}
            className="text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-muted)' }}
          >
            {manageFlowerTypes ? 'Listo' : 'Gestionar'}
          </button>
        </div>
        <div>
          <div className="flex flex-wrap gap-2 items-center">
          {allFlowerTypes.map((ft) => {
            const selected = form.flowerTypes.includes(ft);
            const isPending_ = pendingNewTypes.includes(ft);

            if (manageFlowerTypes && !isPending_) {
              if (renamingType === ft) {
                return (
                  <div key={ft} className="flex items-center gap-1">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newName = renameValue.toLowerCase().trim();
                          if (newName && newName !== ft && !allFlowerTypes.includes(newName)) {
                            startTransition(async () => {
                              const result = await renameFlowerType(ft, newName);
                              if (result.success) {
                                if (form.flowerTypes.includes(ft)) {
                                  set('flowerTypes', form.flowerTypes.map((t) => t === ft ? newName : t));
                                }
                                setRenamingType(null);
                              } else {
                                setError(result.error ?? 'Error al renombrar');
                              }
                            });
                          }
                        }
                        if (e.key === 'Escape') setRenamingType(null);
                      }}
                      className="rounded-full px-3 py-1 text-sm border outline-none focus:ring-1"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-dark)',
                        background: 'var(--color-white)',
                        width: '130px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setRenamingType(null)}
                      className="text-xs"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      ×
                    </button>
                  </div>
                );
              }

              if (deletingType === ft) {
                return (
                  <div
                    key={ft}
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-sm border"
                    style={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-white))',
                    }}
                  >
                    <span className="capitalize">{ft}</span>
                    {deleteUsageCount !== null && deleteUsageCount > 0 && (
                      <span className="text-xs">({deleteUsageCount} producto{deleteUsageCount !== 1 ? 's' : ''})</span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await deleteFlowerType(ft);
                          if (result.success) {
                            set('flowerTypes', form.flowerTypes.filter((t) => t !== ft));
                            setDeletingType(null);
                            setDeleteUsageCount(null);
                          } else {
                            setError(result.error ?? 'Error al eliminar');
                          }
                        });
                      }}
                      className="text-xs font-medium underline"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeletingType(null); setDeleteUsageCount(null); }}
                      className="text-xs"
                    >
                      ×
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={ft}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-dark)',
                    background: selected ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-white))' : 'var(--color-surface)',
                  }}
                >
                  <span className="capitalize">{ft}</span>
                  <button
                    type="button"
                    onClick={() => { setRenamingType(ft); setRenameValue(ft); setDeletingType(null); }}
                    className="text-xs transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-muted)' }}
                    title="Renombrar"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingType(ft);
                      setRenamingType(null);
                      setDeleteUsageCount(null);
                      void (async () => {
                        try {
                          const res = await fetch(
                            `/api/admin/flower-type-usage?name=${encodeURIComponent(ft)}`,
                          );
                          const data = (await res.json()) as { products: { product_id: string }[] };
                          setDeleteUsageCount(data.products.length);
                        } catch {
                          setDeleteUsageCount(0);
                        }
                      })();
                    }}
                    className="text-xs transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-primary)' }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              );
            }

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
          {showNewTypeInput ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTypeInput}
                onChange={(e) => setNewTypeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const name = newTypeInput.toLowerCase().trim();
                    if (name && !allFlowerTypes.includes(name)) {
                      setPendingNewTypes((prev) => [...prev, name]);
                      set('flowerTypes', [...form.flowerTypes, name]);
                      setNewTypeInput('');
                      setShowNewTypeInput(false);
                    }
                  }
                  if (e.key === 'Escape') {
                    setNewTypeInput('');
                    setShowNewTypeInput(false);
                  }
                }}
                ref={newTypeInputRef}
                placeholder="nuevo tipo..."
                className="rounded-full px-3 py-1 text-sm border outline-none focus:ring-1"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-dark)',
                  background: 'var(--color-white)',
                  width: '140px',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const name = newTypeInput.toLowerCase().trim();
                  if (name && !allFlowerTypes.includes(name)) {
                    setPendingNewTypes((prev) => [...prev, name]);
                    set('flowerTypes', [...form.flowerTypes, name]);
                    setNewTypeInput('');
                    setShowNewTypeInput(false);
                  }
                }}
                className="rounded-full px-2 py-1 text-xs font-medium transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => { setNewTypeInput(''); setShowNewTypeInput(false); }}
                className="rounded-full px-2 py-1 text-xs transition-colors"
                style={{ color: 'var(--color-muted)' }}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewTypeInput(true)}
              className="rounded-full px-3 py-1 text-sm border border-dashed transition-colors hover:opacity-70"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              + Nuevo tipo
            </button>
          )}
          </div>
        </div>
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
