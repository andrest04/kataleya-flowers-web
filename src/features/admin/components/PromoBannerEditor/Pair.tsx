'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';
import { createPromoBannerPair, updatePromoBannerPair } from '@/features/admin/actions/promoBanners';

import PromoBannerFields from './Fields';
import {
  type FieldErrors,
  fieldErrorsFromIssues,
  messageFromFailure,
  pickBannerErrors,
} from './formErrors';
import SharedFields from './SharedFields';
import type { PromoBannerDraft } from './types';

function hasDraftChanges(current: PromoBannerDraft, baseline: PromoBannerDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

interface SharedState {
  endsAt: string;
  isActive: boolean;
  name: string;
  startsAt: string;
}

function computeIsDirty(
  shared: SharedState,
  initialShared: SharedState,
  drafts: [PromoBannerDraft, PromoBannerDraft],
  initials: [PromoBannerDraft, PromoBannerDraft],
): boolean {
  return shared.name !== initialShared.name
    || shared.isActive !== initialShared.isActive
    || shared.startsAt !== initialShared.startsAt
    || shared.endsAt !== initialShared.endsAt
    || drafts.some((draft, index) => hasDraftChanges(draft, initials[index]));
}

function toPayload(draft: PromoBannerDraft, shared: Pick<PromoBannerDraft, 'endsAt' | 'isActive' | 'name' | 'startsAt'>) {
  return {
    contentPosition: draft.contentPosition,
    ctaLabel: draft.ctaLabel,
    ctaType: draft.ctaType,
    ctaValue: draft.ctaValue,
    description: draft.description,
    endsAt: shared.endsAt,
    imageUrl: draft.imageUrl,
    isActive: shared.isActive,
    name: shared.name,
    startsAt: shared.startsAt,
    title: draft.title,
  };
}

interface PromoBannerPairEditorProps {
  allowHide?: boolean;
  bannerIds?: [string, string];
  heading?: ReactNode;
  initials: [PromoBannerDraft, PromoBannerDraft];
  showCancel?: boolean;
  whatsappHref: string;
}

export default function PromoBannerPairEditor({
  allowHide = true,
  bannerIds,
  heading,
  initials,
  showCancel = false,
  whatsappHref,
}: PromoBannerPairEditorProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(initials);
  const [name, setName] = useState(initials[0].name);
  const [isActive, setIsActive] = useState(initials[0].isActive);
  const [startsAt, setStartsAt] = useState(initials[0].startsAt);
  const [endsAt, setEndsAt] = useState(initials[0].endsAt);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = computeIsDirty(
    { endsAt, isActive, name, startsAt },
    { endsAt: initials[0].endsAt, isActive: initials[0].isActive, name: initials[0].name, startsAt: initials[0].startsAt },
    drafts,
    initials,
  );

  function patch(index: 0 | 1, next: Partial<PromoBannerDraft>) {
    setDrafts((current) => {
      const copy: [PromoBannerDraft, PromoBannerDraft] = [current[0], current[1]];
      copy[index] = { ...current[index], ...next };
      return copy;
    });
  }

  function handleRevert() {
    setDrafts(initials);
    setName(initials[0].name);
    setIsActive(initials[0].isActive);
    setStartsAt(initials[0].startsAt);
    setEndsAt(initials[0].endsAt);
    setError(null);
    setFieldErrors({});
  }

  async function handleSave() {
    if (!isDirty) return;
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const shared = { endsAt, isActive, name, startsAt };
      const payloads = [toPayload(drafts[0], shared), toPayload(drafts[1], shared)];
      const result = bannerIds
        ? await updatePromoBannerPair(bannerIds, payloads)
        : await createPromoBannerPair(payloads);
      if (!result.success) {
        setFieldErrors(fieldErrorsFromIssues(result.issues));
        setError(messageFromFailure(result));
        return;
      }
      if (showCancel || bannerIds) {
        router.push('/admin/inicio');
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap items-end gap-4 ${heading ? 'justify-between' : 'justify-end'}`}>
        {heading ? <div className="min-w-0">{heading}</div> : null}
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
      </div>
      <FormError message={error} />
      <SharedFields
        allowHide={allowHide}
        endsAt={endsAt}
        errors={fieldErrors}
        isActive={isActive}
        name={name}
        startsAt={startsAt}
        onEndsAtChange={setEndsAt}
        onIsActiveChange={setIsActive}
        onNameChange={setName}
        onStartsAtChange={setStartsAt}
      />
      <PromoBannerFields
        draft={drafts[0]}
        errors={pickBannerErrors(fieldErrors, 'a')}
        idPrefix="banner-a"
        showSchedule={false}
        onChange={(next) => patch(0, next)}
        whatsappHref={whatsappHref}
      />
      <PromoBannerFields
        draft={drafts[1]}
        errors={pickBannerErrors(fieldErrors, 'b')}
        idPrefix="banner-b"
        showSchedule={false}
        onChange={(next) => patch(1, next)}
        whatsappHref={whatsappHref}
      />
    </div>
  );
}
