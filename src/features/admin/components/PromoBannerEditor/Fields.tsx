'use client';

import { useState } from 'react';

import { FormError, FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import CoverButton from '@/features/admin/components/CoverEditor/CoverButton';
import CoverDialog from '@/features/admin/components/CoverEditor/CoverDialog';
import { BANNER_COVER_CROP } from '@/features/admin/components/CoverEditor/profile';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';
import { useImageUpload } from '@/features/admin/hooks/useImageUpload';
import PromoBannerCard from '@/features/landing/components/PromoBanners/PromoBannerCard';

import CtaFields from './CtaFields';
import type { FieldErrors } from './formErrors';
import { persistCta } from './mapDraft';
import ScheduleFields from './ScheduleFields';
import type { PromoBannerDraft } from './types';

interface PromoBannerFieldsProps {
  allowHide?: boolean;
  draft: PromoBannerDraft;
  errors?: FieldErrors;
  idPrefix: string;
  onChange: (patch: Partial<PromoBannerDraft>) => void;
  showSchedule?: boolean;
  whatsappHref: string;
}

export default function PromoBannerFields({
  allowHide = true,
  draft,
  errors = {},
  idPrefix,
  onChange,
  showSchedule = true,
  whatsappHref,
}: PromoBannerFieldsProps) {
  const { uploadImage, isUploading, error: uploadError } = useImageUpload();
  const [coverOpen, setCoverOpen] = useState(false);
  const persisted = persistCta(draft, whatsappHref);
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
        <CtaFields
          ctaLabel={draft.ctaLabel}
          ctaType={draft.ctaType}
          ctaValue={draft.ctaValue}
          errors={errors}
          idPrefix={idPrefix}
          onChange={onChange}
        />
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
          <ScheduleFields
            allowHide={allowHide}
            endsAt={draft.endsAt}
            errors={errors}
            idPrefix={idPrefix}
            isActive={draft.isActive}
            startsAt={draft.startsAt}
            onChange={onChange}
          />
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
