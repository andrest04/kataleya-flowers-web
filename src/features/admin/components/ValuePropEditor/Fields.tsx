'use client';

import { valuePropIcon } from '@/components/shared/ValuePropsBand/icons';
import ValuePropCard from '@/components/shared/ValuePropsBand/ValuePropCard';
import { FormField } from '@/components/ui/FormField';
import { Input, Textarea } from '@/components/ui/Input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { FieldError } from '@/features/admin/components/ProductForm/FieldError';
import { HOME_VALUE_PROP_LIMIT_COPY } from '@/lib/valuePropLimit';

import DestinationModePicker from './DestinationModePicker';
import type { FieldErrors } from './formErrors';
import IconPicker from './IconPicker';
import {
  destinationModeFromFlags,
  flagsFromDestinationMode,
  type ValuePropDestinationMode,
  type ValuePropDraft,
} from './types';

const HREF_PLACEHOLDERS: Record<ValuePropDestinationMode, string> = {
  anchor: '#nosotros',
  external: 'https://',
  route: '/catalogo',
};

interface ValuePropFieldsProps {
  allowActivate?: boolean;
  allowHide?: boolean;
  draft: ValuePropDraft;
  errors?: FieldErrors;
  idPrefix: string;
  onChange: (patch: Partial<ValuePropDraft>) => void;
}

export default function ValuePropFields({
  allowActivate = true,
  allowHide = true,
  draft,
  errors = {},
  idPrefix,
  onChange,
}: ValuePropFieldsProps) {
  const destinationMode = destinationModeFromFlags(draft.isAnchor, draft.isExternal);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="relative w-full overflow-hidden rounded-xl border border-(--color-border) bg-(--color-white) lg:sticky lg:top-24">
        <ValuePropCard
          Icon={valuePropIcon(draft.icon)}
          description={draft.description || 'La descripción aparecerá aquí.'}
          href={draft.href || '#'}
          isAnchor={draft.isAnchor}
          isExternal={draft.isExternal}
          linkLabel={draft.linkLabel || 'Texto del enlace'}
          preview
          title={draft.title || 'Título'}
        />
      </div>
      <div className="grid gap-4 rounded-xl border border-(--color-border) bg-(--color-white) p-4">
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
        <FormField label="Texto del enlace" required htmlFor={`${idPrefix}-link-label`}>
          <Input
            id={`${idPrefix}-link-label`}
            value={draft.linkLabel}
            aria-invalid={Boolean(errors.linkLabel)}
            aria-describedby={errors.linkLabel ? `${idPrefix}-link-label-error` : undefined}
            onChange={(event) => onChange({ linkLabel: event.target.value })}
          />
          <FieldError id={`${idPrefix}-link-label-error`} message={errors.linkLabel} />
        </FormField>
        <div className="space-y-1.5">
          <p id={`${idPrefix}-destination-label`} className="text-sm leading-none font-medium">
            Destino
            <span className="text-primary"> *</span>
          </p>
          <DestinationModePicker
            idPrefix={idPrefix}
            value={destinationMode}
            onChange={(mode) => onChange(flagsFromDestinationMode(mode))}
          />
        </div>
        <FormField label="Enlace" required htmlFor={`${idPrefix}-href`}>
          <Input
            id={`${idPrefix}-href`}
            value={draft.href}
            placeholder={HREF_PLACEHOLDERS[destinationMode]}
            inputMode={destinationMode === 'external' ? 'url' : undefined}
            aria-invalid={Boolean(errors.href)}
            aria-describedby={errors.href ? `${idPrefix}-href-error` : undefined}
            onChange={(event) => onChange({ href: event.target.value })}
          />
          <FieldError id={`${idPrefix}-href-error`} message={errors.href} />
        </FormField>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={draft.isActive}
              disabled={(!allowHide && draft.isActive) || (!allowActivate && !draft.isActive)}
              label={draft.isActive ? 'Ocultar en el sitio' : 'Mostrar en el sitio'}
              onChange={(checked) => {
                if (!checked && !allowHide) return;
                if (checked && !allowActivate) return;
                onChange({ isActive: checked });
              }}
            />
            <span className="text-sm text-(--color-dark)">
              {draft.isActive ? 'Visible' : 'Oculto'}
            </span>
          </div>
          {allowActivate || draft.isActive ? null : (
            <p className="text-sm text-(--color-muted)">{HOME_VALUE_PROP_LIMIT_COPY}</p>
          )}
        </div>
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
  );
}
