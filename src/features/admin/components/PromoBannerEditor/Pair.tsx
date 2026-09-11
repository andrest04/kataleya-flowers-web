'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError, FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { createPromoBannerPair, updatePromoBannerPair } from '@/features/admin/actions/promoBanners';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';

import PromoBannerFields from './Fields';
import {
  type FieldErrors,
  fieldErrorsFromIssues,
  messageFromFailure,
  pickBannerErrors,
} from './formErrors';
import type { PromoBannerDraft } from './types';

function hasDraftChanges(current: PromoBannerDraft, baseline: PromoBannerDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
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
  const isDirty = name !== initials[0].name
    || isActive !== initials[0].isActive
    || startsAt !== initials[0].startsAt
    || endsAt !== initials[0].endsAt
    || drafts.some((draft, index) => hasDraftChanges(draft, initials[index]));

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
      <div className="grid gap-4 rounded-xl border border-(--color-border) bg-(--color-white) p-4 md:grid-cols-2">
        <FormField label="Nombre" required htmlFor="preset-name">
          <Input
            id="preset-name"
            value={name}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'preset-name-error' : undefined}
            onChange={(event) => setName(event.target.value)}
            placeholder="Flores Amarillas"
          />
          <FieldError id="preset-name-error" message={fieldErrors.name} />
        </FormField>
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={isActive}
            disabled={!allowHide && isActive}
            label={isActive ? 'Ocultar en la portada' : 'Mostrar en la portada'}
            onChange={(checked) => {
              if (!checked && !allowHide) return;
              setIsActive(checked);
            }}
          />
          <span className="text-sm text-(--color-dark)">
            {isActive ? 'Visible' : 'Oculto'}
          </span>
        </div>
        <FormField label="Mostrar desde" htmlFor="preset-starts">
          <Input
            id="preset-starts"
            type="datetime-local"
            value={startsAt}
            aria-invalid={Boolean(fieldErrors.startsAt)}
            aria-describedby={fieldErrors.startsAt ? 'preset-starts-error' : undefined}
            onChange={(event) => setStartsAt(event.target.value)}
          />
          <FieldError id="preset-starts-error" message={fieldErrors.startsAt} />
        </FormField>
        <FormField label="Ocultar desde" htmlFor="preset-ends">
          <Input
            id="preset-ends"
            type="datetime-local"
            value={endsAt}
            aria-invalid={Boolean(fieldErrors.endsAt)}
            aria-describedby={fieldErrors.endsAt ? 'preset-ends-error' : undefined}
            onChange={(event) => setEndsAt(event.target.value)}
          />
          <FieldError id="preset-ends-error" message={fieldErrors.endsAt} />
        </FormField>
      </div>
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
