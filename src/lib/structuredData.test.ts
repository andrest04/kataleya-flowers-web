import { describe, expect, it } from 'vitest';

import { BUSINESS } from './constants';
import { defaultSiteSettings } from './siteSettings';
import {
  buildFloristJsonLd,
  buildProductJsonLd,
  parseMapCoordinates,
  productImageUrls,
} from './structuredData';

const settings = defaultSiteSettings();
const floristId = `${BUSINESS.website}/#florist`;

type JsonObject = Record<string, unknown>;

function field(source: JsonObject, key: string): JsonObject {
  return source[key] as JsonObject;
}

describe('parseMapCoordinates', () => {
  it('reads the !3d latitude and !2d longitude of an embed URL', () => {
    const coords = parseMapCoordinates(BUSINESS.mapsEmbedUrl);
    expect(coords?.latitude).toBeCloseTo(-12.13, 2);
    expect(coords?.longitude).toBeCloseTo(-77.02, 2);
  });

  it('reads a q=lat,lng embed URL', () => {
    expect(
      parseMapCoordinates('https://www.google.com/maps?q=-12.1,-77.05&z=16&output=embed'),
    ).toEqual({ latitude: -12.1, longitude: -77.05 });
  });

  it('returns null for a place-name query', () => {
    expect(
      parseMapCoordinates('https://www.google.com/maps?q=Floreria%20Floritel&output=embed'),
    ).toBeNull();
  });

  it('returns null for out-of-range or missing values', () => {
    expect(parseMapCoordinates('')).toBeNull();
    expect(parseMapCoordinates('https://www.google.com/maps?q=120,10')).toBeNull();
    expect(parseMapCoordinates('not a url')).toBeNull();
  });
});

describe('buildFloristJsonLd', () => {
  const postalAddress = BUSINESS.postalAddress;

  it('emits @id, image, geo, hasMap and areaServed', () => {
    const ld = buildFloristJsonLd(settings, postalAddress);
    expect(ld['@type']).toBe('Florist');
    expect(ld['@id']).toBe(floristId);
    expect(ld.image).toBe(`${BUSINESS.website}/opengraph-image`);
    const geo = field(ld, 'geo');
    expect(geo['@type']).toBe('GeoCoordinates');
    expect(geo.latitude).toBeCloseTo(-12.13, 2);
    expect(geo.longitude).toBeCloseTo(-77.02, 2);
    expect(ld.hasMap).toMatch(/^https:\/\/www\.google\.com\/maps\?q=-12\.13\d*,-77\.02\d*$/);
    expect(ld.areaServed).toEqual({ '@type': 'City', name: postalAddress.areaServed });
  });

  it('builds the address from the business constants without duplicating the locality', () => {
    const address = field(buildFloristJsonLd(settings, postalAddress), 'address');
    expect(address['@type']).toBe('PostalAddress');
    expect(address.streetAddress).toBe('Teodosio Parreño 115 (ex cortijo)');
    expect(String(address.streetAddress)).not.toMatch(/Lima, Perú$/);
    expect(address.addressLocality).toBe(postalAddress.locality);
    expect(address.addressRegion).toBe(postalAddress.region);
    expect(address.addressCountry).toBe(postalAddress.country);
    expect(address).not.toHaveProperty('postalCode');
  });

  it('prefers the district and emits postalCode and the Business Profile when set', () => {
    const ld = buildFloristJsonLd(settings, {
      ...postalAddress,
      district: 'Surquillo',
      googleBusinessProfileUrl: 'https://maps.google.com/?cid=123',
      postalCode: '15038',
    });
    const address = field(ld, 'address');
    expect(address.addressLocality).toBe('Surquillo');
    expect(address.postalCode).toBe('15038');
    expect(ld.sameAs).toEqual([settings.instagram, 'https://maps.google.com/?cid=123']);
  });

  it('lists only Instagram in sameAs while the Business Profile is unset', () => {
    expect(buildFloristJsonLd(settings, postalAddress).sameAs).toEqual([settings.instagram]);
  });

  it('omits geo and hasMap when the map URL has no coordinates', () => {
    const ld = buildFloristJsonLd(
      { ...settings, mapsEmbedUrl: 'https://www.google.com/maps?q=Floritel&output=embed' },
      postalAddress,
    );
    expect(ld).not.toHaveProperty('geo');
    expect(ld).not.toHaveProperty('hasMap');
  });
});

describe('buildProductJsonLd', () => {
  const productUrl = `${BUSINESS.website}/catalogo/amor/ramo-rosas`;
  const baseProduct = {
    description: 'Ramo de rosas rojas',
    id: 'prod-1',
    imageUrl: '',
    name: 'Ramo de rosas',
    price: 120,
  };

  it('has @id, sku and seller, and no image key when every image is empty', () => {
    const ld = buildProductJsonLd({
      categoryName: 'Amor',
      product: baseProduct,
      productUrl,
      settings,
    });
    expect(ld['@id']).toBe(`${productUrl}#product`);
    expect(ld.sku).toBe('prod-1');
    expect(ld).not.toHaveProperty('image');
    const offers = field(ld, 'offers');
    expect(offers['@type']).toBe('Offer');
    expect(field(offers, 'seller')['@id']).toBe(floristId);
  });

  it('keeps the non-empty images and builds an AggregateOffer from the price table', () => {
    const ld = buildProductJsonLd({
      categoryName: 'Amor',
      product: {
        ...baseProduct,
        images: ['', 'https://cdn.example/a.jpg'],
        priceTable: [
          { label: 'S', price: 90 },
          { label: 'L', price: 150 },
        ],
      },
      productUrl,
      settings,
    });
    expect(ld.image).toEqual(['https://cdn.example/a.jpg']);
    const offers = field(ld, 'offers');
    expect(offers['@type']).toBe('AggregateOffer');
    expect(offers.lowPrice).toBe(90);
    expect(offers.highPrice).toBe(150);
    expect(field(offers, 'seller')['@id']).toBe(floristId);
  });
});

describe('productImageUrls', () => {
  it('falls back to imageUrl and drops blank entries', () => {
    expect(productImageUrls({ imageUrl: ' ', images: ['', '  '] })).toEqual([]);
    expect(productImageUrls({ imageUrl: 'https://cdn.example/b.jpg', images: [''] })).toEqual([
      'https://cdn.example/b.jpg',
    ]);
  });
});
