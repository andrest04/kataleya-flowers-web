import type { ValuePropView } from '@/features/landing/queries/getPublishedValueProps';
import type { ValueProp } from '@/lib/database/repositories/valueProps';

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

export function draftFromValueProp(item: ValueProp): ValuePropDraft {
  return {
    description: item.description,
    endsAt: toDatetimeLocalValue(item.endsAt),
    href: item.href,
    icon: item.icon,
    isActive: item.isActive,
    isAnchor: item.isAnchor,
    isExternal: item.isExternal,
    linkLabel: item.linkLabel,
    startsAt: toDatetimeLocalValue(item.startsAt),
    title: item.title,
  };
}
