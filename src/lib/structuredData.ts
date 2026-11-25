import { floristSeoDescription, schemaDayNames, type SiteSettings } from '@/lib/siteSettings';

export interface BusinessPostalAddress {
  areaServed: string;
  country: string;
  district: string | null;
  googleBusinessProfileUrl: string | null;
  locality: string;
  postalCode: string | null;
  region: string;
}

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export type FloristSettings = Pick<
  SiteSettings,
  | 'address'
  | 'experience'
  | 'hours'
  | 'instagram'
  | 'location'
  | 'mapsEmbedUrl'
  | 'name'
  | 'phone'
  | 'website'
>;

export interface StructuredProduct {
  description: string;
  id: string;
  imageUrl: string;
  images?: readonly string[];
  name: string;
  price: number;
  priceTable?: readonly { label: string; price: number }[];
}

interface ProductJsonLdInput {
  categoryName: string;
  product: StructuredProduct;
  productUrl: string;
  settings: Pick<SiteSettings, 'name' | 'website'>;
}

const EMBED_LATITUDE = /!3d(-?\d+(?:\.\d+)?)/;
const EMBED_LONGITUDE = /!2d(-?\d+(?:\.\d+)?)/;
const COORDINATE_PAIR = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
const IN_STOCK = 'https://schema.org/InStock';

function toCoordinates(lat: string, lng: string): MapCoordinates | null {
  const latitude = Number(lat);
  const longitude = Number(lng);
  const valid =
    Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
  return valid ? { latitude, longitude } : null;
}

export function parseMapCoordinates(mapsUrl: string): MapCoordinates | null {
  const latitude = mapsUrl.match(EMBED_LATITUDE);
  const longitude = mapsUrl.match(EMBED_LONGITUDE);
  if (latitude && longitude) return toCoordinates(latitude[1], longitude[1]);

  let url: URL;
  try {
    url = new URL(mapsUrl);
  } catch {
    return null;
  }
  const pair = (url.searchParams.get('q') ?? url.searchParams.get('ll') ?? '').match(
    COORDINATE_PAIR,
  );
  return pair ? toCoordinates(pair[1], pair[2]) : null;
}

export function floristJsonLdId(website: string): string {
  return `${website}/#florist`;
}

function streetAddressOf(address: string, location: string): string {
  const trimmed = address.trim();
  const suffix = `, ${location.trim()}`;
  return location.trim() && trimmed.endsWith(suffix)
    ? trimmed.slice(0, -suffix.length).trim()
    : trimmed;
}

function postalAddressJsonLd(
  settings: FloristSettings,
  postalAddress: BusinessPostalAddress,
): Record<string, unknown> {
  return {
    '@type': 'PostalAddress',
    streetAddress: streetAddressOf(settings.address, settings.location),
    addressLocality: postalAddress.district ?? postalAddress.locality,
    addressRegion: postalAddress.region,
    ...(postalAddress.postalCode ? { postalCode: postalAddress.postalCode } : {}),
    addressCountry: postalAddress.country,
  };
}

function geoJsonLd(mapsEmbedUrl: string): Record<string, unknown> {
  const coordinates = parseMapCoordinates(mapsEmbedUrl);
  if (!coordinates) return {};
  return {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
    hasMap: `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`,
  };
}

export function buildFloristJsonLd(
  settings: FloristSettings,
  postalAddress: BusinessPostalAddress,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    '@id': floristJsonLdId(settings.website),
    name: settings.name,
    description: floristSeoDescription(settings),
    url: settings.website,
    image: `${settings.website}/opengraph-image`,
    telephone: `+${settings.phone}`,
    address: postalAddressJsonLd(settings, postalAddress),
    ...geoJsonLd(settings.mapsEmbedUrl),
    areaServed: { '@type': 'City', name: postalAddress.areaServed },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: schemaDayNames(settings.hours.openDays),
        opens: settings.hours.opens,
        closes: settings.hours.closes,
      },
    ],
    sameAs: postalAddress.googleBusinessProfileUrl
      ? [settings.instagram, postalAddress.googleBusinessProfileUrl]
      : [settings.instagram],
    priceRange: 'S/30 — S/800',
  };
}

export function productImageUrls(
  product: Pick<StructuredProduct, 'imageUrl' | 'images'>,
): string[] {
  const listed = (product.images ?? []).filter((url) => url.trim().length > 0);
  if (listed.length > 0) return listed;
  return product.imageUrl.trim() ? [product.imageUrl] : [];
}

export function buildProductJsonLd({
  categoryName,
  product,
  productUrl,
  settings,
}: ProductJsonLdInput): Record<string, unknown> {
  const seller = {
    '@type': 'Florist',
    '@id': floristJsonLdId(settings.website),
    name: settings.name,
  };
  const prices = product.priceTable?.map((variant) => variant.price) ?? [];
  const offers =
    prices.length > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'PEN',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          availability: IN_STOCK,
          url: productUrl,
          seller,
        }
      : {
          '@type': 'Offer',
          priceCurrency: 'PEN',
          price: product.price,
          availability: IN_STOCK,
          url: productUrl,
          seller,
        };
  const images = productImageUrls(product);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    sku: product.id,
    name: product.name,
    description: product.description,
    ...(images.length > 0 ? { image: images } : {}),
    brand: { '@type': 'Brand', name: settings.name },
    category: categoryName,
    offers,
  };
}
