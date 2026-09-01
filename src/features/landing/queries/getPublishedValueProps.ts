import { unstable_cache } from 'next/cache';

import { listValueProps } from '@/lib/appwrite/repositories/valueProps';
import { BUSINESS } from '@/lib/constants';
import { isPublished } from '@/lib/publishing';
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
    description: `Tres décadas armando arreglos para las familias de ${BUSINESS.location}.`,
    href: '#nosotros',
    icon: 'flower2',
    id: 'v-001',
    isAnchor: true,
    isExternal: false,
    linkLabel: 'Conoce la historia',
    title: `${BUSINESS.experience} años floreciendo`,
  },
  {
    description: `${BUSINESS.hours.weekdays}, de ${BUSINESS.hours.time}, en ${BUSINESS.address}.`,
    href: '#contacto',
    icon: 'sprout',
    id: 'v-002',
    isAnchor: true,
    isExternal: false,
    linkLabel: 'Ver ubicación',
    title: `${BUSINESS.hours.weekdays} · ${BUSINESS.hours.time}`,
  },
  {
    description: `Publicamos cada ramo que sale de la tienda en ${BUSINESS.instagramHandle}.`,
    href: BUSINESS.instagram,
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
  if (state.status === 'published') return state.items;
  if (state.status === 'fallback') return [...FALLBACK_VALUE_PROPS];
  return [];
}
