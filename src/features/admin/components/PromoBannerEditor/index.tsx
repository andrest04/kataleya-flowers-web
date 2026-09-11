'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError, FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { createPromoBanner, updatePromoBanner } from '@/features/admin/actions/promoBanners';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import PromoBannerFields from './Fields';
import { type FieldErrors, fieldErrorsFromIssues, messageFromFailure } from './formErrors';
import type { PromoBannerDraft } from './types';

function hasDraftChanges(current: PromoBannerDraft, baseline: PromoBannerDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

function toPayload(draft: PromoBannerDraft) {
  return {
    contentPosition: draft.contentPosition,
    ctaLabel: draft.ctaLabel,
    ctaType: draft.ctaType,
    ctaValue: draft.ctaValue,
    description: draft.description,
    endsAt: draft.endsAt,
    imageUrl: draft.imageUrl,
    isActive: draft.isActive,
    name: draft.name,
    startsAt: draft.startsAt,
    title: draft.title,
  };
}

interface PromoBannerEditorProps {
  allowHide?: boolean;
  bannerId?: string;
  heading?: ReactNode;
  initial: PromoBannerDraft;
  showCancel?: boolean;
  whatsappHref: string;
}

export default function PromoBannerEditor({
  allowHide = true,
  bannerId,
  heading,
  initial,
  showCancel = true,
  whatsappHref,
}: PromoBannerEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = hasDraftChanges(draft, initial);

  function patch(next: Partial<PromoBannerDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function handleRevert() {
    setDraft(initial);
    setError(null);
    setFieldErrors({});
  }

  async function handleSave() {
    if (!hasDraftChanges(draft, initial)) return;
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = bannerId
        ? await updatePromoBanner(bannerId, toPayload(draft))
        : await createPromoBanner(toPayload(draft));
      if (!result.success) {
        setFieldErrors(fieldErrorsFromIssues(result.issues));
        setError(messageFromFailure(result));
        return;
      }
      router.push('/admin/inicio');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  const actions = (
    <div className="flex shrink-0 flex-wrap gap-3">
      <Button
        type="button"
        disabled={!isDirty || isSaving}
        onClick={() => void handleSave()}
      >
        {isSaving ? 'Guardando…' : 'Publicar en la portada'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={!isDirty || isSaving}
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
      <FormError message={error} />
      <FormField label="Nombre" required htmlFor="banner-name">
        <Input
          id="banner-name"
          value={draft.name}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'banner-name-error' : undefined}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="Flores Amarillas"
        />
        <FieldError id="banner-name-error" message={fieldErrors.name} />
      </FormField>
      <PromoBannerFields
        allowHide={allowHide}
        draft={draft}
        errors={fieldErrors}
        idPrefix="banner"
        onChange={patch}
        whatsappHref={whatsappHref}
      />
    </div>
  );
}
