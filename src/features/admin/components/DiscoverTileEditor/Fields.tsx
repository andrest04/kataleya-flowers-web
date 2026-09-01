'use client';

import { useState } from 'react';

import { FormError, FormField } from '@/components/ui/FormField';
import { Input, Textarea } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import CoverButton from '@/features/admin/components/CoverEditor/CoverButton';
import CoverDialog from '@/features/admin/components/CoverEditor/CoverDialog';
import { DISCOVER_COVER_CROP } from '@/features/admin/components/CoverEditor/profile';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';
import VisibilityLimitControl from '@/features/admin/components/VisibilityLimitControl';
import { useImageUpload } from '@/features/admin/hooks/useImageUpload';
import EditorialTile from '@/features/landing/components/DiscoverMoreSection/EditorialTile';
import { discoverIcon } from '@/features/landing/components/DiscoverMoreSection/icons';
import { HOME_DISCOVER_TILE_LIMIT_COPY } from '@/lib/discoverTileLimit';

import type { FieldErrors } from './formErrors';
import IconPicker from './IconPicker';
import type { DiscoverTileDraft } from './types';

interface DiscoverTileFieldsProps {
  allowActivate?: boolean;
  allowHide?: boolean;
  draft: DiscoverTileDraft;
  errors?: FieldErrors;
  idPrefix: string;
  onChange: (patch: Partial<DiscoverTileDraft>) => void;
}

export default function DiscoverTileFields({
  allowActivate = true,
  allowHide = true,
  draft,
  errors = {},
  idPrefix,
  onChange,
}: DiscoverTileFieldsProps) {
  const { uploadImage, isUploading, error: uploadError } = useImageUpload();
  const [coverOpen, setCoverOpen] = useState(false);

  async function handlePickImage(file: File) {
    const url = await uploadImage(file, 'contenido');
    if (!url) return;
    onChange({ imageUrl: url });
    setCoverOpen(false);
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="relative mx-auto w-full max-w-xs lg:sticky lg:top-24">
          <EditorialTile
            cover={<CoverButton onClick={() => setCoverOpen(true)} />}
            description={draft.description || 'La descripción aparecerá aquí.'}
            external={draft.isExternal}
            href={draft.href || '#'}
            Icon={discoverIcon(draft.icon)}
            imageSrc={draft.imageUrl}
            preview
            title={draft.title || 'Título'}
          />
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
          <FormField label="Destino" required htmlFor={`${idPrefix}-href`}>
            <Input
              id={`${idPrefix}-href`}
              value={draft.href}
              aria-invalid={Boolean(errors.href)}
              aria-describedby={errors.href ? `${idPrefix}-href-error` : undefined}
              onChange={(event) => onChange({ href: event.target.value })}
            />
            <FieldError id={`${idPrefix}-href-error`} message={errors.href} />
          </FormField>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={draft.isExternal}
              label="Enlace externo"
              onChange={(checked) => onChange({ isExternal: checked })}
            />
            <span className="text-sm text-(--color-dark)">Enlace externo</span>
          </div>
          <div className="space-y-1.5">
            <p id={`${idPrefix}-icon-label`} className="text-sm leading-none font-medium">
              Icono
              <span className="text-primary"> *</span>
            </p>
            <IconPicker
              error={errors.icon}
              idPrefix={idPrefix}
              value={draft.icon}
              onChange={(icon) => onChange({ icon })}
            />
          </div>
          <VisibilityLimitControl
            allowActivate={allowActivate}
            allowHide={allowHide}
            checked={draft.isActive}
            hideLabel="Ocultar en la portada"
            limitCopy={HOME_DISCOVER_TILE_LIMIT_COPY}
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
        imageAlt={draft.title || 'Tarjeta'}
        imageUrl={draft.imageUrl}
        open={coverOpen}
        profile={DISCOVER_COVER_CROP}
        onOpenChange={setCoverOpen}
        onPickFile={(file) => void handlePickImage(file)}
      />
    </>
  );
}
