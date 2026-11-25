import {
  createProvisioningContext,
  ensureBucket,
  ensureCollection,
  finish,
  keyIndex,
  PUBLIC_FILE_READ,
} from './lib/appwrite-provisioning.mjs';

const PRIVATE = { permissions: [], documentSecurity: false };
const EXISTING = { mustExist: true };

const COLLECTIONS = [
  {
    id: 'complaints',
    name: 'Complaints',
    ...EXISTING,
    attributes: [{ kind: 'integer', key: 'correlativo_year', required: false }],
  },
  { id: 'counters', name: 'Counters', ...EXISTING },
  {
    id: 'rate_limits',
    name: 'Rate Limits',
    attributes: [
      { kind: 'integer', key: 'count', required: true },
      { kind: 'datetime', key: 'expires_at', required: true },
    ],
    indexes: [keyIndex('expires_at_idx', ['expires_at'])],
  },
  { id: 'products', name: 'Products', ...EXISTING },
  { id: 'categories', name: 'Categories', ...EXISTING },
  { id: 'product_images', name: 'Product Images', ...EXISTING },
  { id: 'colors', name: 'Colors', ...EXISTING },
  { id: 'flower_types', name: 'Flower Types', ...EXISTING },
  { id: 'color_assignments', name: 'Color Assignments', ...EXISTING },
  { id: 'flower_type_assignments', name: 'Flower Type Assignments', ...EXISTING },
];

const PUBLIC_BUCKETS = ['product_images', 'category_images'];

const context = createProvisioningContext();

for (const collection of COLLECTIONS) {
  await ensureCollection(context, { ...collection, ...PRIVATE });
}

for (const bucketId of PUBLIC_BUCKETS) {
  await ensureBucket(context, { id: bucketId, permissions: [PUBLIC_FILE_READ], fileSecurity: false });
}

finish(context);
