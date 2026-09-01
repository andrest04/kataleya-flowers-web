import type { ValuePropView } from '@/features/landing/queries/getPublishedValueProps';
import type { ValuePropRow } from '@/lib/db/rows';

import type { ValuePropDraft } from './types';

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function draftFromFallback(item: ValuePropView): ValuePropDraft {
  return {
    description: item.description,
    endsAt: '',
    href: item.href,
    icon: item.icon,
    isActive: true,
    isAnchor: item.isAnchor,
    isExternal: item.isExternal,
    linkLabel: item.linkLabel,
    startsAt: '',
    title: item.title,
  };
}

export function draftFromValueProp(item: ValuePropRow): ValuePropDraft {
  return {
    description: item.description,
    endsAt: toDatetimeLocalValue(item.ends_at),
    href: item.href,
    icon: item.icon,
    isActive: item.is_active,
    isAnchor: item.is_anchor,
    isExternal: item.is_external,
    linkLabel: item.link_label,
    startsAt: toDatetimeLocalValue(item.starts_at),
    title: item.title,
  };
}
