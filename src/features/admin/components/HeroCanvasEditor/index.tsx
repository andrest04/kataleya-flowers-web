'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError, FormField } from '@/components/ui/FormField';
import { Input, Select } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { createHeroSlide, updateHeroSlide } from '@/features/admin/actions/heroSlides';
import CoverDialog from '@/features/admin/components/CoverEditor/CoverDialog';
import { HERO_COVER_CROP } from '@/features/admin/components/CoverEditor/profile';
import { useImageUpload } from '@/features/admin/hooks/useImageUpload';
import type { HeroCtaType } from '@/lib/db/rows';

import Canvas from './Canvas';
import HeroLiveFrame from './HeroLiveFrame';
import type { HeroDraft } from './types';

function hasDraftChanges(current: HeroDraft, baseline: HeroDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

interface HeroCanvasEditorProps {
  allowHide?: boolean;
  heading?: ReactNode;
  initial: HeroDraft;
  showCancel?: boolean;
  slideId?: string;
}

export default function HeroCanvasEditor({
  allowHide = true,
  heading,
  initial,
  showCancel = true,
  slideId,
}: HeroCanvasEditorProps) {
  const router = useRouter();
  const { uploadImage, isUploading, error: uploadError } = useImageUpload();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const isDirty = hasDraftChanges(draft, initial);

  function patch(next: Partial<HeroDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  async function handlePickImage(file: File) {
    const url = await uploadImage(file, 'contenido');
    if (!url) return;
    patch({ focus: '50% center', imageUrl: url });
    setCoverOpen(false);
  }

  function handleRevert() {
    setDraft(initial);
    setError(null);
  }

  async function handleSave() {
    if (!hasDraftChanges(draft, initial)) return;
    setIsSaving(true);
    setError(null);
    const payload = {
      altText: draft.altText,
      ctaLabel: draft.ctaLabel,
      ctaType: draft.ctaType,
      ctaValue: draft.ctaValue,
      endsAt: draft.endsAt,
      focus: draft.focus,
      imageUrl: draft.imageUrl,
      isActive: draft.isActive,
      kicker: draft.kicker,
      name: draft.name,
      startsAt: draft.startsAt,
      title: draft.title,
    };
    const result = slideId
      ? await updateHeroSlide(slideId, payload)
      : await createHeroSlide(payload);
    setIsSaving(false);
    if (!result.success) {
      setError(result.error ?? 'No se pudo guardar el hero.');
      return;
    }
    router.push('/admin/inicio');
    router.refresh();
  }

  const actions = (
    <div className="flex shrink-0 flex-wrap gap-3">
      <Button
        type="button"
        disabled={!isDirty || isSaving || isUploading}
        onClick={() => void handleSave()}
      >
        {isSaving ? 'Guardando…' : 'Publicar en la portada'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={!isDirty || isSaving || isUploading}
        onClick={handleRevert}
      >
        Descartar cambios
      </Button>
      {showCancel ? <Button href="/admin/inicio" variant="ghost">Cancelar</Button> : null}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-end gap-4 ${heading ? 'justify-between' : 'justify-end'}`}>
        {heading ? <div className="min-w-0">{heading}</div> : null}
        {actions}
      </div>
      <FormError message={error ?? uploadError} />
      <div className="-mx-4 overflow-hidden md:-mx-8">
        <HeroLiveFrame onEditPhoto={() => setCoverOpen(true)}>
          <Canvas draft={draft} onChange={patch} />
        </HeroLiveFrame>
      </div>
      <CoverDialog
        busy={isUploading}
        imageAlt={draft.altText}
        imageUrl={draft.imageUrl}
        open={coverOpen}
        profile={HERO_COVER_CROP}
        onOpenChange={setCoverOpen}
        onPickFile={(file) => void handlePickImage(file)}
      />

      <div className="grid gap-4 rounded-xl border border-(--color-border) bg-(--color-white) p-4 md:grid-cols-2">
        <FormField label="Nombre" required htmlFor="hero-name">
          <Input
            id="hero-name"
            value={draft.name}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="Flores Amarillas"
          />
        </FormField>
        <FormField label="Texto del botón" htmlFor="hero-cta-label">
          <Input
            id="hero-cta-label"
            value={draft.ctaLabel}
            onChange={(event) => patch({ ctaLabel: event.target.value })}
            placeholder={draft.ctaType === 'catalogo' ? 'Ver catálogo' : 'Pedir por WhatsApp'}
          />
        </FormField>
        <FormField label="El botón lleva a" htmlFor="hero-cta-type">
          <Select
            id="hero-cta-type"
            value={draft.ctaType}
            onChange={(event) => patch({ ctaType: event.target.value as HeroCtaType })}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="catalogo">Catálogo</option>
            <option value="url">Otra URL</option>
          </Select>
        </FormField>
        {draft.ctaType === 'url' ? (
          <FormField label="URL del botón" required htmlFor="hero-cta-value">
            <Input
              id="hero-cta-value"
              type="url"
              value={draft.ctaValue}
              onChange={(event) => patch({ ctaValue: event.target.value })}
            />
          </FormField>
        ) : null}
        <FormField label="Descripción de la foto" required htmlFor="hero-alt">
          <Input
            id="hero-alt"
            value={draft.altText}
            onChange={(event) => patch({ altText: event.target.value })}
          />
        </FormField>
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={draft.isActive}
            disabled={!allowHide && draft.isActive}
            label={draft.isActive ? 'Ocultar en la portada' : 'Mostrar en la portada'}
            onChange={(checked) => {
              if (!checked && !allowHide) return;
              patch({ isActive: checked });
            }}
          />
          <span className="text-sm text-(--color-dark)">
            {draft.isActive ? 'Visible' : 'Oculto'}
          </span>
        </div>
        <FormField label="Mostrar desde" htmlFor="hero-starts">
          <Input
            id="hero-starts"
            type="datetime-local"
            value={draft.startsAt}
            onChange={(event) => patch({ startsAt: event.target.value })}
          />
        </FormField>
        <FormField label="Ocultar desde" htmlFor="hero-ends">
          <Input
            id="hero-ends"
            type="datetime-local"
            value={draft.endsAt}
            onChange={(event) => patch({ endsAt: event.target.value })}
          />
        </FormField>
      </div>
    </div>
  );
}
