'use client';

import { useState } from 'react';

import { FormError, FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import CoverButton from '@/features/admin/components/CoverEditor/CoverButton';
import CoverDialog from '@/features/admin/components/CoverEditor/CoverDialog';
import { TESTIMONIAL_COVER_CROP } from '@/features/admin/components/CoverEditor/profile';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';
import VisibilityLimitControl from '@/features/admin/components/VisibilityLimitControl';
import { useImageUpload } from '@/features/admin/hooks/useImageUpload';
import TestimonialCard from '@/features/landing/components/TestimonialsGallery/TestimonialCard';
import { HOME_TESTIMONIAL_LIMIT_COPY } from '@/lib/testimonialLimit';

import type { FieldErrors } from './formErrors';
import type { TestimonialDraft } from './types';

interface TestimonialFieldsProps {
  allowActivate?: boolean;
  allowHide?: boolean;
  draft: TestimonialDraft;
  errors?: FieldErrors;
  idPrefix: string;
  onChange: (patch: Partial<TestimonialDraft>) => void;
}

export default function TestimonialFields({
  allowActivate = true,
  allowHide = true,
  draft,
  errors = {},
  idPrefix,
  onChange,
}: TestimonialFieldsProps) {
  const { uploadImage, isUploading, error: uploadError } = useImageUpload();
  const [coverOpen, setCoverOpen] = useState(false);

  async function handlePickImage(file: File) {
    const url = await uploadImage(file, 'contenido');
    if (!url) return;
    onChange({ photoUrl: url });
    setCoverOpen(false);
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="relative mx-auto w-fit lg:sticky lg:top-24">
          <TestimonialCard
            cover={<CoverButton onClick={() => setCoverOpen(true)} />}
            testimonial={{
              id: 'preview',
              name: draft.name || 'Nombre',
              occasion: draft.occasion || 'Ocasión',
              photoAlt: draft.photoAlt,
              photoSrc: draft.photoUrl,
              quote: draft.quote || 'La cita aparecerá aquí.',
              stars: draft.stars,
            }}
          />
          <FieldError id={`${idPrefix}-image-error`} message={errors.photoUrl} />
        </div>
        <div className="grid gap-4 rounded-xl border border-(--color-border) bg-(--color-white) p-4">
          <FormError message={uploadError} />
          <FormField label="Nombre" required htmlFor={`${idPrefix}-name`}>
            <Input
              id={`${idPrefix}-name`}
              value={draft.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
              onChange={(event) => onChange({ name: event.target.value })}
            />
            <FieldError id={`${idPrefix}-name-error`} message={errors.name} />
          </FormField>
          <FormField label="Ocasión" required htmlFor={`${idPrefix}-occasion`}>
            <Input
              id={`${idPrefix}-occasion`}
              value={draft.occasion}
              aria-invalid={Boolean(errors.occasion)}
              aria-describedby={errors.occasion ? `${idPrefix}-occasion-error` : undefined}
              onChange={(event) => onChange({ occasion: event.target.value })}
            />
            <FieldError id={`${idPrefix}-occasion-error`} message={errors.occasion} />
          </FormField>
          <FormField label="Cita" required htmlFor={`${idPrefix}-quote`}>
            <Textarea
              id={`${idPrefix}-quote`}
              rows={4}
              value={draft.quote}
              aria-invalid={Boolean(errors.quote)}
              aria-describedby={errors.quote ? `${idPrefix}-quote-error` : undefined}
              onChange={(event) => onChange({ quote: event.target.value })}
            />
            <FieldError id={`${idPrefix}-quote-error`} message={errors.quote} />
          </FormField>
          <FormField label="Estrellas" required htmlFor={`${idPrefix}-stars`}>
            <Select
              id={`${idPrefix}-stars`}
              value={String(draft.stars)}
              aria-invalid={Boolean(errors.stars)}
              aria-describedby={errors.stars ? `${idPrefix}-stars-error` : undefined}
              onChange={(event) => onChange({ stars: Number(event.target.value) })}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </Select>
            <FieldError id={`${idPrefix}-stars-error`} message={errors.stars} />
          </FormField>
          <FormField label="Texto alternativo" required htmlFor={`${idPrefix}-alt`}>
            <Input
              id={`${idPrefix}-alt`}
              value={draft.photoAlt}
              aria-invalid={Boolean(errors.photoAlt)}
              aria-describedby={errors.photoAlt ? `${idPrefix}-alt-error` : undefined}
              onChange={(event) => onChange({ photoAlt: event.target.value })}
            />
            <FieldError id={`${idPrefix}-alt-error`} message={errors.photoAlt} />
          </FormField>
          <VisibilityLimitControl
            allowActivate={allowActivate}
            allowHide={allowHide}
            checked={draft.isActive}
            hideLabel="Ocultar en la portada"
            limitCopy={HOME_TESTIMONIAL_LIMIT_COPY}
            showLabel="Mostrar en la portada"
            onChange={(checked) => onChange({ isActive: checked })}
          />
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
        </div>
      </div>
      <CoverDialog
        busy={isUploading}
        imageAlt={draft.photoAlt || draft.name || 'Testimonio'}
        imageUrl={draft.photoUrl}
        open={coverOpen}
        profile={TESTIMONIAL_COVER_CROP}
        onOpenChange={setCoverOpen}
        onPickFile={(file) => void handlePickImage(file)}
      />
    </>
  );
}
