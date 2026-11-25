import {
  createProvisioningContext,
  ensureBucket,
  ensureCollection,
  finish,
  PUBLIC_FILE_READ,
} from './lib/appwrite-provisioning.mjs';

const CONTENT_PERMISSIONS = [];

const PUBLISHING = [
  { kind: 'boolean', key: 'is_active', required: true },
  { kind: 'datetime', key: 'starts_at', required: false },
  { kind: 'datetime', key: 'ends_at', required: false },
  { kind: 'integer', key: 'display_order', required: true },
];

const COLLECTIONS = [
  {
    id: 'hero_slides',
    name: 'Hero Slides',
    attributes: [
      { kind: 'string', key: 'image_url', size: 1024, required: true },
      { kind: 'string', key: 'alt_text', size: 255, required: true },
      { kind: 'string', key: 'kicker', size: 255, required: true },
      { kind: 'string', key: 'title', size: 255, required: true },
      { kind: 'string', key: 'subtitle', size: 500, required: false },
      { kind: 'enum', key: 'cta_type', elements: ['whatsapp', 'catalogo', 'url'], required: true },
      { kind: 'string', key: 'cta_value', size: 2048, required: false },
      { kind: 'string', key: 'cta_label', size: 255, required: false },
      { kind: 'string', key: 'focus', size: 64, required: false },
      ...PUBLISHING,
    ],
  },
  {
    id: 'promo_banners',
    name: 'Promo Banners',
    attributes: [
      { kind: 'string', key: 'image_url', size: 1024, required: true },
      { kind: 'string', key: 'title', size: 255, required: true },
      { kind: 'string', key: 'description', size: 1000, required: true },
      { kind: 'string', key: 'cta_label', size: 255, required: true },
      { kind: 'string', key: 'cta_href', size: 2048, required: true },
      { kind: 'boolean', key: 'cta_external', required: true },
      { kind: 'enum', key: 'content_position', elements: ['top', 'bottom'], required: true },
      { kind: 'string', key: 'name', size: 255, required: false },
      ...PUBLISHING,
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    attributes: [
      { kind: 'string', key: 'photo_url', size: 1024, required: true },
      { kind: 'string', key: 'photo_alt', size: 255, required: true },
      { kind: 'string', key: 'name', size: 255, required: true },
      { kind: 'string', key: 'occasion', size: 255, required: true },
      { kind: 'string', key: 'quote', size: 1000, required: true },
      { kind: 'integer', key: 'stars', required: true, min: 1, max: 5 },
      ...PUBLISHING,
    ],
  },
  {
    id: 'discover_tiles',
    name: 'Discover Tiles',
    attributes: [
      { kind: 'string', key: 'image_url', size: 1024, required: true },
      { kind: 'string', key: 'icon', size: 64, required: true },
      { kind: 'string', key: 'title', size: 255, required: true },
      { kind: 'string', key: 'description', size: 500, required: true },
      { kind: 'string', key: 'href', size: 2048, required: true },
      { kind: 'boolean', key: 'is_external', required: true },
      ...PUBLISHING,
    ],
  },
  {
    id: 'value_props',
    name: 'Value Props',
    attributes: [
      { kind: 'string', key: 'icon', size: 64, required: true },
      { kind: 'string', key: 'title', size: 255, required: true },
      { kind: 'string', key: 'description', size: 500, required: true },
      { kind: 'string', key: 'link_label', size: 255, required: true },
      { kind: 'string', key: 'href', size: 2048, required: true },
      { kind: 'boolean', key: 'is_anchor', required: true },
      { kind: 'boolean', key: 'is_external', required: true },
      ...PUBLISHING,
    ],
  },
  {
    id: 'site_settings',
    name: 'Site Settings',
    attributes: [
      { kind: 'string', key: 'phone', size: 32, required: true },
      { kind: 'string', key: 'email', size: 255, required: true },
      { kind: 'string', key: 'instagram_handle', size: 64, required: true },
      { kind: 'string', key: 'address', size: 500, required: true },
      { kind: 'string', key: 'location', size: 255, required: true },
      { kind: 'string', key: 'maps_embed_url', size: 2048, required: true },
      { kind: 'string', key: 'hours_weekdays', size: 64, required: true },
      { kind: 'string', key: 'hours_time', size: 64, required: true },
      { kind: 'string', key: 'hours_opens', size: 8, required: true },
      { kind: 'string', key: 'hours_closes', size: 8, required: true },
      { kind: 'string', key: 'hours_open_days', size: 32, required: true },
      { kind: 'string', key: 'razon_social', size: 255, required: true },
      { kind: 'string', key: 'ruc', size: 11, required: true },
      { kind: 'string', key: 'whatsapp_default', size: 500, required: true },
      { kind: 'string', key: 'whatsapp_float', size: 500, required: true },
      { kind: 'string', key: 'whatsapp_product', size: 500, required: true },
      { kind: 'string', key: 'announcement_text', size: 500, required: true },
      { kind: 'string', key: 'announcement_cta_label', size: 255, required: true },
      { kind: 'string', key: 'announcement_cta_href', size: 2048, required: true },
      { kind: 'boolean', key: 'announcement_is_active', required: true },
      { kind: 'datetime', key: 'announcement_starts_at', required: false },
      { kind: 'datetime', key: 'announcement_ends_at', required: false },
      { kind: 'string', key: 'catalog_title', size: 255, required: true },
      { kind: 'string', key: 'bestsellers_title', size: 255, required: true },
      { kind: 'string', key: 'discover_title', size: 255, required: true },
      { kind: 'string', key: 'contact_title', size: 255, required: true },
    ],
  },
];

const context = createProvisioningContext();

await ensureBucket(context, {
  id: 'content_images',
  permissions: [PUBLIC_FILE_READ],
  fileSecurity: false,
  createOptions: {
    maximumFileSize: 10 * 1024 * 1024,
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  },
});

for (const collection of COLLECTIONS) {
  await ensureCollection(context, {
    ...collection,
    permissions: CONTENT_PERMISSIONS,
    documentSecurity: false,
  });
}

finish(context);
