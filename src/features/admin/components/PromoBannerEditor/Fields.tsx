'use client';

import { useState } from 'react';

import { FormError, FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import CoverButton from '@/features/admin/components/CoverEditor/CoverButton';
import CoverDialog from '@/features/admin/components/CoverEditor/CoverDialog';
import { BANNER_COVER_CROP } from '@/features/admin/components/CoverEditor/profile';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';
import { useImageUpload } from '@/features/admin/hooks/useImageUpload';
import PromoBannerCard from '@/features/landing/components/PromoBanners/PromoBannerCard';

import type { FieldErrors } from './formErrors';
import { persistCta } from './mapDraft';
import type { PromoBannerCtaType, PromoBannerDraft } from './types';

interface PromoBannerFieldsProps {
  allowHide?: boolean;
  draft: PromoBannerDraft;
  errors?: FieldErrors;
  idPrefix: string;
  onChange: (patch: Partial<PromoBannerDraft>) => void;
  showSchedule?: boolean;
}

export default function PromoBannerFields({
  allowHide = true,
  draft,
  errors = {},
  idPrefix,
  onChange,
  showSchedule = true,
}: PromoBannerFieldsProps) {
  const { uploadImage, isUploading, error: uploadError } = useImageUpload();
  const [coverOpen, setCoverOpen] = useState(false);
  const persisted = persistCta(draft);
  const previewCta = {
    external: persisted.ctaExternal,
    href: persisted.ctaHref || '#',
    label: persisted.ctaLabel || (draft.ctaType === 'catalogo' ? 'Ver catálogo' : 'Pedir por WhatsApp'),
    variant: persisted.ctaHref.includes('wa.me') ? 'whatsapp' as const : 'primary' as const,
  };

  async function handlePickImage(file: File) {
    const url = await uploadImage(file, 'contenido');
    if (!url) return;
    onChange({ imageUrl: url });
    setCoverOpen(false);
  }

  return (
    <>
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="relative lg:sticky lg:top-24">
        <div className="pointer-events-none">
          <PromoBannerCard
            contentPosition={draft.contentPosition}
            cta={previewCta}
            description={draft.description}
            heading={draft.title}
            imageSrc={draft.imageUrl}
          />
        </div>
        <CoverButton onClick={() => setCoverOpen(true)} />
        <FieldError id={`${idPrefix}-image-error`} message={errors.imageUrl} />
      </div>
      <div className="grid gap-4 rounded-xl border border-(--color-border) bg-(--color-white) p-4">
        <FormError message={uploadError} />
        <FormField label="Título" required htmlFor={`${idPrefix}-title`}>
          <Input
            id={`${idPrefix}-title`}
            value={draft.title}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${idPrefix}-title-error` : undefined}
            onChange={(event) => onChange({ title: event.target.value })}
          />
          <FieldError id={`${idPrefix}-title-error`} message={errors.title} />
        </FormField>
        <FormField label="Descripción" required htmlFor={`${idPrefix}-description`}>
          <Textarea
            id={`${idPrefix}-description`}
            rows={3}
            value={draft.description}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? `${idPrefix}-description-error` : undefined}
            onChange={(event) => onChange({ description: event.target.value })}
          />
          <FieldError id={`${idPrefix}-description-error`} message={errors.description} />
        </FormField>
        <FormField label="El botón lleva a" htmlFor={`${idPrefix}-cta-type`}>
          <Select
            id={`${idPrefix}-cta-type`}
            value={draft.ctaType}
            onChange={(event) => onChange({ ctaType: event.target.value as PromoBannerCtaType })}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="catalogo">Catálogo</option>
            <option value="url">Otra URL</option>
          </Select>
        </FormField>
        <FormField label="Texto del botón" required htmlFor={`${idPrefix}-cta-label`}>
          <Input
            id={`${idPrefix}-cta-label`}
            value={draft.ctaLabel}
            aria-invalid={Boolean(errors.ctaLabel)}
            aria-describedby={errors.ctaLabel ? `${idPrefix}-cta-label-error` : undefined}
            onChange={(event) => onChange({ ctaLabel: event.target.value })}
            placeholder={draft.ctaType === 'catalogo' ? 'Ver catálogo' : 'Pedir por WhatsApp'}
          />
          <FieldError id={`${idPrefix}-cta-label-error`} message={errors.ctaLabel} />
        </FormField>
        {draft.ctaType === 'url' ? (
          <FormField label="URL del botón" required htmlFor={`${idPrefix}-cta-value`}>
            <Input
              id={`${idPrefix}-cta-value`}
              type="url"
              value={draft.ctaValue}
              aria-invalid={Boolean(errors.ctaValue)}
              aria-describedby={errors.ctaValue ? `${idPrefix}-cta-value-error` : undefined}
              onChange={(event) => onChange({ ctaValue: event.target.value })}
            />
            <FieldError id={`${idPrefix}-cta-value-error`} message={errors.ctaValue} />
          </FormField>
        ) : null}
        <FormField label="Posición del texto" htmlFor={`${idPrefix}-position`}>
          <Select
            id={`${idPrefix}-position`}
            value={draft.contentPosition}
            onChange={(event) => onChange({
              contentPosition: event.target.value === 'top' ? 'top' : 'bottom',
            })}
          >
            <option value="top">Texto arriba</option>
            <option value="bottom">Texto abajo</option>
          </Select>
        </FormField>
        {showSchedule ? (
          <>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={draft.isActive}
                disabled={!allowHide && draft.isActive}
                label={draft.isActive ? 'Ocultar en la portada' : 'Mostrar en la portada'}
                onChange={(checked) => {
                  if (!checked && !allowHide) return;
                  onChange({ isActive: checked });
                }}
              />
              <span className="text-sm text-(--color-dark)">
                {draft.isActive ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <FormField label="Mostrar desde" htmlFor={`${idPrefix}-starts`}>
              <Input
                id={`${idPrefix}-starts`}
                type="datetime-local"
                value={draft.startsAt}
                aria-invalid={Boolean(errors.startsAt)}
                aria-describedby={errors.startsAt ? `${idPrefix}-starts-error` : undefined}
                onChange={(event) => onChange({ startsAt: event.target.value })}
              />
              <FieldError id={`${idPrefix}-starts-error`} message={errors.startsAt} />
            </FormField>
            <FormField label="Ocultar desde" htmlFor={`${idPrefix}-ends`}>
              <Input
                id={`${idPrefix}-ends`}
                type="datetime-local"
                value={draft.endsAt}
                aria-invalid={Boolean(errors.endsAt)}
                aria-describedby={errors.endsAt ? `${idPrefix}-ends-error` : undefined}
                onChange={(event) => onChange({ endsAt: event.target.value })}
              />
              <FieldError id={`${idPrefix}-ends-error`} message={errors.endsAt} />
            </FormField>
          </>
        ) : null}
      </div>
    </div>
    <CoverDialog
      busy={isUploading}
      imageAlt={draft.title || 'Banner'}
      imageUrl={draft.imageUrl}
      open={coverOpen}
      profile={BANNER_COVER_CROP}
      onOpenChange={setCoverOpen}
      onPickFile={(file) => void handlePickImage(file)}
    />
    </>
  );
}
