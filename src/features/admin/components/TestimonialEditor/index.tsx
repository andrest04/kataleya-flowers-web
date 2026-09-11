'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';
import { createTestimonial, updateTestimonial } from '@/features/admin/actions/testimonials';

import TestimonialFields from './Fields';
import { type FieldErrors, fieldErrorsFromIssues, messageFromFailure } from './formErrors';
import type { TestimonialDraft } from './types';

function hasDraftChanges(current: TestimonialDraft, baseline: TestimonialDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

function toPayload(draft: TestimonialDraft) {
  return {
    endsAt: draft.endsAt,
    isActive: draft.isActive,
    name: draft.name,
    occasion: draft.occasion,
    photoAlt: draft.photoAlt,
    photoUrl: draft.photoUrl,
    quote: draft.quote,
    stars: draft.stars,
    startsAt: draft.startsAt,
  };
}

interface TestimonialEditorProps {
  allowActivate?: boolean;
  allowHide?: boolean;
  fromFallbackId?: string;
  heading?: ReactNode;
  initial: TestimonialDraft;
  showCancel?: boolean;
  testimonialId?: string;
}

export default function TestimonialEditor({
  allowActivate = true,
  allowHide = true,
  fromFallbackId,
  heading,
  initial,
  showCancel = true,
  testimonialId,
}: TestimonialEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = hasDraftChanges(draft, initial);
  const canSave = testimonialId ? isDirty : true;

  function patch(next: Partial<TestimonialDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function handleRevert() {
    setDraft(initial);
    setError(null);
    setFieldErrors({});
  }

  async function handleSave() {
    if (testimonialId && !hasDraftChanges(draft, initial)) return;
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const payload = fromFallbackId
        ? { ...toPayload(draft), fromFallbackId }
        : toPayload(draft);
      const result = testimonialId
        ? await updateTestimonial(testimonialId, toPayload(draft))
        : await createTestimonial(payload);
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
        disabled={!canSave || isSaving}
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
      <TestimonialFields
        allowActivate={allowActivate}
        allowHide={allowHide}
        draft={draft}
        errors={fieldErrors}
        idPrefix="testimonial"
        onChange={patch}
      />
    </div>
  );
}
