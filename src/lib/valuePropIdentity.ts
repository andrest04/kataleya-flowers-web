import { BUSINESS } from '@/lib/constants';
import type { SiteSettings } from '@/lib/siteSettings';

export const VALUE_PROP_INSTAGRAM_HREF = 'instagram';

export const VALUE_PROP_IDENTITY_TOKEN = {
  address: '{direccion}',
  handle: '{instagram}',
  location: '{ubicacion}',
  time: '{hora}',
  weekdays: '{dias}',
} as const;

interface ValuePropIdentityFields {
  description: string;
  href: string;
  isAnchor: boolean;
  isExternal: boolean;
  linkLabel?: string;
  title: string;
}

interface IdentityPair {
  from: string;
  to: string;
}

function isInstagramHost(hostname: string): boolean {
  return hostname === 'instagram.com' || hostname === 'www.instagram.com';
}

export function isInstagramHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === VALUE_PROP_INSTAGRAM_HREF) return true;

  let hostname: string;
  try {
    hostname = new URL(trimmed).hostname;
  } catch {
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return false;
    try {
      hostname = new URL(`https://${trimmed}`).hostname;
    } catch {
      return false;
    }
  }
  return isInstagramHost(hostname.toLowerCase());
}

function longestFirst(pairs: IdentityPair[]): IdentityPair[] {
  return pairs
    .filter((pair) => pair.from.length > 0 && pair.from !== pair.to)
    .sort((a, b) => b.from.length - a.from.length);
}

function replacePairs(value: string, pairs: IdentityPair[]): string {
  return longestFirst(pairs).reduce(
    (current, pair) => current.replaceAll(pair.from, pair.to),
    value,
  );
}

function interpolateTokens(value: string, settings: SiteSettings): string {
  return value
    .replaceAll(VALUE_PROP_IDENTITY_TOKEN.handle, settings.instagramHandle)
    .replaceAll(VALUE_PROP_IDENTITY_TOKEN.weekdays, settings.hours.weekdays)
    .replaceAll(VALUE_PROP_IDENTITY_TOKEN.time, settings.hours.time)
    .replaceAll(VALUE_PROP_IDENTITY_TOKEN.address, settings.address)
    .replaceAll(VALUE_PROP_IDENTITY_TOKEN.location, settings.location);
}

function bakedBusinessPairs(settings: SiteSettings): IdentityPair[] {
  return [
    { from: BUSINESS.instagram, to: settings.instagram },
    { from: BUSINESS.instagramHandle, to: settings.instagramHandle },
    { from: BUSINESS.address, to: settings.address },
    { from: BUSINESS.hours.weekdays, to: settings.hours.weekdays },
    { from: BUSINESS.hours.time, to: settings.hours.time },
    { from: BUSINESS.location, to: settings.location },
  ];
}

function tokenizePairs(settings: SiteSettings): IdentityPair[] {
  return [
    { from: settings.instagram, to: VALUE_PROP_IDENTITY_TOKEN.handle },
    { from: BUSINESS.instagram, to: VALUE_PROP_IDENTITY_TOKEN.handle },
    { from: settings.instagramHandle, to: VALUE_PROP_IDENTITY_TOKEN.handle },
    { from: BUSINESS.instagramHandle, to: VALUE_PROP_IDENTITY_TOKEN.handle },
    { from: settings.address, to: VALUE_PROP_IDENTITY_TOKEN.address },
    { from: BUSINESS.address, to: VALUE_PROP_IDENTITY_TOKEN.address },
    { from: settings.hours.weekdays, to: VALUE_PROP_IDENTITY_TOKEN.weekdays },
    { from: BUSINESS.hours.weekdays, to: VALUE_PROP_IDENTITY_TOKEN.weekdays },
    { from: settings.hours.time, to: VALUE_PROP_IDENTITY_TOKEN.time },
    { from: BUSINESS.hours.time, to: VALUE_PROP_IDENTITY_TOKEN.time },
    { from: settings.location, to: VALUE_PROP_IDENTITY_TOKEN.location },
    { from: BUSINESS.location, to: VALUE_PROP_IDENTITY_TOKEN.location },
  ];
}

function bindIdentityText(value: string, settings: SiteSettings): string {
  return replacePairs(interpolateTokens(value, settings), bakedBusinessPairs(settings));
}

function bindCopy(value: string, settings: SiteSettings, instagramBound: boolean): string {
  const bound = bindIdentityText(value, settings);
  if (!instagramBound) return bound;
  return bound.replace(/@[\w.]+/g, settings.instagramHandle);
}

function withMappedLinkLabel<T extends ValuePropIdentityFields>(
  item: T,
  mapped: T,
  mapLabel: (value: string) => string,
): T {
  if (item.linkLabel === undefined) return mapped;
  return { ...mapped, linkLabel: mapLabel(item.linkLabel) };
}

export function bindValuePropIdentity<T extends ValuePropIdentityFields>(
  item: T,
  settings: SiteSettings,
): T {
  const instagramBound = isInstagramHref(item.href);
  const mapped = {
    ...item,
    description: bindCopy(item.description, settings, instagramBound),
    href: instagramBound ? settings.instagram : bindIdentityText(item.href, settings),
    isAnchor: instagramBound ? false : item.isAnchor,
    isExternal: instagramBound ? true : item.isExternal,
    title: bindCopy(item.title, settings, instagramBound),
  };
  return withMappedLinkLabel(item, mapped, (value) => bindIdentityText(value, settings));
}

export function tokenizeValuePropIdentity<T extends ValuePropIdentityFields>(
  item: T,
  settings: SiteSettings,
): T {
  const instagramBound = isInstagramHref(item.href);
  const tokenizeText = (value: string) => replacePairs(value, tokenizePairs(settings));
  const mapped = {
    ...item,
    description: tokenizeText(item.description),
    href: instagramBound ? VALUE_PROP_INSTAGRAM_HREF : tokenizeText(item.href),
    isAnchor: instagramBound ? false : item.isAnchor,
    isExternal: instagramBound ? true : item.isExternal,
    title: tokenizeText(item.title),
  };
  return withMappedLinkLabel(item, mapped, tokenizeText);
}
