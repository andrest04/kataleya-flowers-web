'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';
import { saveSiteSettings } from '@/features/admin/actions/siteSettings';
import { isDerivedWhatsappCta } from '@/lib/siteSettings';

import SiteSettingsFields from './Fields';
import {
  FIELD_FOCUS_ORDER,
  type FieldErrors,
  fieldErrorsFromIssues,
  fieldId,
  messageFromFailure,
} from './formErrors';
import type { SiteSettingsDraft } from './types';

function toPayload(draft: SiteSettingsDraft) {
  return {
    address: draft.address,
    announcementCtaHref: draft.announcementCtaHref,
    announcementCtaLabel: draft.announcementCtaLabel,
    announcementEndsAt: draft.announcementEndsAt,
    announcementIsActive: draft.announcementIsActive,
    announcementStartsAt: draft.announcementStartsAt,
    announcementText: draft.announcementText,
    bestsellersTitle: draft.bestsellersTitle,
    catalogTitle: draft.catalogTitle,
    contactTitle: draft.contactTitle,
    discoverTitle: draft.discoverTitle,
    email: draft.email,
    hoursCloses: draft.hoursCloses,
    hoursOpens: draft.hoursOpens,
    hoursTime: draft.hoursTime,
    hoursWeekdays: draft.hoursWeekdays,
    instagramHandle: draft.instagramHandle,
    location: draft.location,
    mapsEmbedUrl: draft.mapsEmbedUrl,
    mapsLink: draft.mapsLink,
    openDays: draft.openDays,
    phone: draft.phone,
    razonSocial: draft.razonSocial,
    ruc: draft.ruc,
    whatsappDefault: draft.whatsappDefault,
    whatsappFloat: draft.whatsappFloat,
    whatsappProduct: draft.whatsappProduct,
  };
}

function hasDraftChanges(current: SiteSettingsDraft, baseline: SiteSettingsDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

function focusFirstInvalid(errors: FieldErrors): void {
  const first = FIELD_FOCUS_ORDER.find((key) => errors[key]);
  if (!first) return;
  const node = document.getElementById(fieldId(first));
  if (node instanceof HTMLElement) node.focus();
}

interface SiteSettingsFormProps {
  initial: SiteSettingsDraft;
}

export default function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = hasDraftChanges(draft, baseline);

  function patch(next: Partial<SiteSettingsDraft>) {
    setDraft((current) => ({ ...current, ...next }));
    setSaved(false);
  }

  function handleRevert() {
    setDraft(baseline);
    setError(null);
    setFieldErrors({});
    setSaved(false);
  }

  async function handleSave() {
    if (!hasDraftChanges(draft, baseline) || isSaving) return;
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);
    try {
      const result = await saveSiteSettings(toPayload(draft));
      if (!result.success) {
        const nextErrors = fieldErrorsFromIssues(result.issues);
        setFieldErrors(nextErrors);
        setError(messageFromFailure(result));
        focusFirstInvalid(nextErrors);
        return;
      }
      const next: SiteSettingsDraft = {
        ...draft,
        announcementCtaHref: isDerivedWhatsappCta(draft.announcementCtaHref)
          ? ''
          : draft.announcementCtaHref,
        mapsEmbedUrl: result.mapsEmbedUrl,
        mapsLink: '',
      };
      setDraft(next);
      setBaseline(next);
      setSaved(true);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p
          className="text-sm text-(--color-muted)"
          role="status"
          aria-live="polite"
        >
          {saved && !isDirty ? 'Cambios guardados.' : ''}
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            type="button"
            disabled={!isDirty || isSaving}
            aria-busy={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || isSaving}
            onClick={handleRevert}
          >
            Descartar cambios
          </Button>
        </div>
      </div>
      <FormError message={error} />
      <SiteSettingsFields draft={draft} errors={fieldErrors} onChange={patch} />
    </form>
  );
}
