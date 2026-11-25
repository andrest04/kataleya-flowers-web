export const APPWRITE_DATABASE_ID = 'kataleya';
export const APPWRITE_TEAM_ADMINS_ID = 'admins';

export const APPWRITE_COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  productImages: 'product_images',
  colors: 'colors',
  flowerTypes: 'flower_types',
  colorAssignments: 'color_assignments',
  flowerTypeAssignments: 'flower_type_assignments',
  complaints: 'complaints',
  counters: 'counters',
  rateLimits: 'rate_limits',
  heroSlides: 'hero_slides',
  promoBanners: 'promo_banners',
  testimonials: 'testimonials',
  discoverTiles: 'discover_tiles',
  valueProps: 'value_props',
  siteSettings: 'site_settings',
} as const;

export const APPWRITE_BUCKETS = {
  products: 'product_images',
  categories: 'category_images',
  content: 'content_images',
} as const;

export type AppwriteCollectionIds = typeof APPWRITE_COLLECTIONS;

export type AppwriteBucketIds = typeof APPWRITE_BUCKETS;
