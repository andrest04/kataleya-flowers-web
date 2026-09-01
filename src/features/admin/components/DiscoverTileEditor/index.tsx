'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';
import { createDiscoverTile, updateDiscoverTile } from '@/features/admin/actions/discoverTiles';

import DiscoverTileFields from './Fields';
import { type FieldErrors, fieldErrorsFromIssues, messageFromFailure } from './formErrors';
import type { DiscoverTileDraft } from './types';

function hasDraftChanges(current: DiscoverTileDraft, baseline: DiscoverTileDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

function toPayload(draft: DiscoverTileDraft) {
  return {
    description: draft.description,
    endsAt: draft.endsAt,
    href: draft.href,
    icon: draft.icon,
    imageUrl: draft.imageUrl,
    isActive: draft.isActive,
    isExternal: draft.isExternal,
    startsAt: draft.startsAt,
    title: draft.title,
  };
}

interface DiscoverTileEditorProps {
  allowActivate?: boolean;
  allowHide?: boolean;
  fromFallbackId?: string;
  heading?: ReactNode;
  initial: DiscoverTileDraft;
  showCancel?: boolean;
  tileId?: string;
}

export default function DiscoverTileEditor({
  allowActivate = true,
  allowHide = true,
  fromFallbackId,
  heading,
  initial,
  showCancel = true,
  tileId,
}: DiscoverTileEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = hasDraftChanges(draft, initial);
  const canSave = tileId ? isDirty : true;

  function patch(next: Partial<DiscoverTileDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function handleRevert() {
    setDraft(initial);
    setError(null);
    setFieldErrors({});
  }

  async function handleSave() {
    if (tileId && !hasDraftChanges(draft, initial)) return;
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    const payload = fromFallbackId
      ? { ...toPayload(draft), fromFallbackId }
      : toPayload(draft);
    const result = tileId
      ? await updateDiscoverTile(tileId, toPayload(draft))
      : await createDiscoverTile(payload);
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
      <DiscoverTileFields
        allowActivate={allowActivate}
        allowHide={allowHide}
        draft={draft}
        errors={fieldErrors}
        idPrefix="discover-tile"
        onChange={patch}
      />
    </div>
  );
}
