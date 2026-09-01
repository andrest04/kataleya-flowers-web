'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';
import { createValueProp, updateValueProp } from '@/features/admin/actions/valueProps';

import ValuePropFields from './Fields';
import { type FieldErrors, fieldErrorsFromIssues, messageFromFailure } from './formErrors';
import type { ValuePropDraft } from './types';

function hasDraftChanges(current: ValuePropDraft, baseline: ValuePropDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

function toPayload(draft: ValuePropDraft) {
  return {
    description: draft.description,
    endsAt: draft.endsAt,
    href: draft.href,
    icon: draft.icon,
    isActive: draft.isActive,
    isAnchor: draft.isAnchor,
    isExternal: draft.isExternal,
    linkLabel: draft.linkLabel,
    startsAt: draft.startsAt,
    title: draft.title,
  };
}

interface ValuePropEditorProps {
  allowActivate?: boolean;
  allowHide?: boolean;
  fromFallbackId?: string;
  heading?: ReactNode;
  initial: ValuePropDraft;
  showCancel?: boolean;
  valuePropId?: string;
}

export default function ValuePropEditor({
  allowActivate = true,
  allowHide = true,
  fromFallbackId,
  heading,
  initial,
  showCancel = true,
  valuePropId,
}: ValuePropEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = hasDraftChanges(draft, initial);
  const canSave = valuePropId ? isDirty : true;

  function patch(next: Partial<ValuePropDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function handleRevert() {
    setDraft(initial);
    setError(null);
    setFieldErrors({});
  }

  async function handleSave() {
    if (valuePropId && !hasDraftChanges(draft, initial)) return;
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    const payload = fromFallbackId
      ? { ...toPayload(draft), fromFallbackId }
      : toPayload(draft);
    const result = valuePropId
      ? await updateValueProp(valuePropId, toPayload(draft))
      : await createValueProp(payload);
    setIsSaving(false);
    if (!result.success) {
      setFieldErrors(fieldErrorsFromIssues(result.issues));
      setError(messageFromFailure(result));
      return;
    }
    router.push('/admin/inicio');
    router.refresh();
  }

  const actions = (
    <div className="flex shrink-0 flex-wrap gap-3">
      <Button
        type="button"
        disabled={!canSave || isSaving}
        onClick={() => void handleSave()}
      >
        {isSaving ? 'Guardando…' : 'Publicar en el sitio'}
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
      <ValuePropFields
        allowActivate={allowActivate}
        allowHide={allowHide}
        draft={draft}
        errors={fieldErrors}
        idPrefix="value-prop"
        onChange={patch}
      />
    </div>
  );
}
