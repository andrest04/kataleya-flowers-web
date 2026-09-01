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

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  teamAdminsId: string;
  collections: AppwriteCollectionIds;
  buckets: AppwriteBucketIds;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Appwrite environment variable: ${name} is required.`);
  }
  return value;
}

export function getAppwriteConfig(): AppwriteConfig {
  return {
    endpoint: requireEnv('APPWRITE_ENDPOINT'),
    projectId: requireEnv('APPWRITE_PROJECT_ID'),
    apiKey: requireEnv('APPWRITE_API_KEY'),
    databaseId: APPWRITE_DATABASE_ID,
    teamAdminsId: APPWRITE_TEAM_ADMINS_ID,
    collections: APPWRITE_COLLECTIONS,
    buckets: APPWRITE_BUCKETS,
  };
}
