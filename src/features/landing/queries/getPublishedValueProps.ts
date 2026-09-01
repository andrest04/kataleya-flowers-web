import { unstable_cache } from 'next/cache';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { listValueProps } from '@/lib/appwrite/repositories/valueProps';
import { BUSINESS } from '@/lib/constants';
import { isPublished } from '@/lib/publishing';
import {
  bindValuePropIdentity,
  VALUE_PROP_IDENTITY_TOKEN,
  VALUE_PROP_INSTAGRAM_HREF,
} from '@/lib/valuePropIdentity';
import { HOME_VALUE_PROP_LIMIT } from '@/lib/valuePropLimit';

export interface ValuePropView {
  description: string;
  href: string;
  icon: string;
  id: string;
  isAnchor: boolean;
  isExternal: boolean;
  linkLabel: string;
  title: string;
}

export const FALLBACK_VALUE_PROPS: readonly ValuePropView[] = [
  {
    description: `Tres décadas armando arreglos para las familias de ${VALUE_PROP_IDENTITY_TOKEN.location}.`,
    href: '#nosotros',
    icon: 'flower2',
    id: 'v-001',
    isAnchor: true,
    isExternal: false,
    linkLabel: 'Conoce la historia',
    title: `${BUSINESS.experience} años floreciendo`,
  },
  {
    description: `${VALUE_PROP_IDENTITY_TOKEN.weekdays}, de ${VALUE_PROP_IDENTITY_TOKEN.time}, en ${VALUE_PROP_IDENTITY_TOKEN.address}.`,
    href: '#contacto',
    icon: 'sprout',
    id: 'v-002',
    isAnchor: true,
    isExternal: false,
    linkLabel: 'Ver ubicación',
    title: `${VALUE_PROP_IDENTITY_TOKEN.weekdays} · ${VALUE_PROP_IDENTITY_TOKEN.time}`,
  },
  {
    description: `Publicamos cada ramo que sale de la tienda en ${VALUE_PROP_IDENTITY_TOKEN.handle}.`,
    href: VALUE_PROP_INSTAGRAM_HREF,
    icon: 'flower',
    id: 'v-003',
    isAnchor: false,
    isExternal: true,
    linkLabel: 'Ver Instagram',
    title: 'Míranos en Instagram',
  },
];

type CachedValuePropState =
  | { status: 'published'; items: ValuePropView[] }
  | { status: 'fallback' }
  | { status: 'hidden' };

const getCachedValuePropState = unstable_cache(
  async (): Promise<CachedValuePropState> => {
    const rows = await listValueProps();
    const now = new Date();
    const published = rows.filter((row) => isPublished(row, now));
    if (published.length > 0) {
      return {
        status: 'published',
        items: published.slice(0, HOME_VALUE_PROP_LIMIT).map((row) => ({
          description: row.description,
          href: row.href,
          icon: row.icon,
          id: row.id,
          isAnchor: row.is_anchor,
          isExternal: row.is_external,
          linkLabel: row.link_label,
          title: row.title,
        })),
      };
    }
    return { status: rows.length === 0 ? 'fallback' : 'hidden' };
  },
  ['published-value-props'],
  { tags: ['value-props', 'home-content'], revalidate: 300 },
);

export async function getPublishedValueProps(): Promise<ValuePropView[]> {
  const state = await getCachedValuePropState();
  const settings = await getSiteSettings();
  if (state.status === 'published') {
    return state.items.map((item) => bindValuePropIdentity(item, settings));
  }
  if (state.status === 'fallback') {
    return FALLBACK_VALUE_PROPS.map((item) => bindValuePropIdentity(item, settings));
  }
  return [];
}
