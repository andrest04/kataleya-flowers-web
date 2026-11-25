import { AppwriteException, Client, Databases, DatabasesIndexType, Permission, Role, Storage } from 'node-appwrite';

export const DATABASE_ID = 'kataleya';
export const PUBLIC_FILE_READ = Permission.read(Role.any());

const REQUIRED_ENV = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
const ATTRIBUTE_WAIT_MS = 60_000;

export function createProvisioningContext(argv = process.argv.slice(2)) {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const apply = argv.includes('--apply');
  console.log(apply ? 'mode: apply' : 'mode: dry-run (pass --apply to make changes)');

  return { apply, databases: new Databases(client), storage: new Storage(client), pendingChanges: 0 };
}

function hasCode(error, code) {
  return error instanceof AppwriteException && error.code === code;
}

function isMissingScope(error) {
  return error instanceof AppwriteException && error.type === 'general_unauthorized_scope';
}

async function ignoreConflict(work) {
  try {
    await work();
  } catch (error) {
    if (hasCode(error, 409)) return;
    throw error;
  }
}

async function findOrNull(work) {
  try {
    return await work();
  } catch (error) {
    if (hasCode(error, 404)) return null;
    throw error;
  }
}

function samePermissions(current, desired) {
  const left = [...current].sort();
  const right = [...desired].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function show(value) {
  return JSON.stringify(value);
}

function expectedType(attribute) {
  return attribute.kind === 'enum' ? 'string' : attribute.kind;
}

function planCollection(current, desired) {
  const changes = [];
  const warnings = [];
  const currentAttributes = new Map((current?.attributes ?? []).map((attribute) => [attribute.key, attribute]));
  const currentIndexes = new Map((current?.indexes ?? []).map((index) => [index.key, index]));

  if (!current) {
    changes.push(`create collection permissions=${show(desired.permissions)} documentSecurity=${desired.documentSecurity}`);
  } else {
    if (!samePermissions(current.$permissions, desired.permissions)) {
      changes.push(`permissions ${show(current.$permissions)} -> ${show(desired.permissions)}`);
    }
    if (current.documentSecurity !== desired.documentSecurity) {
      changes.push(`documentSecurity ${current.documentSecurity} -> ${desired.documentSecurity}`);
    }
  }

  const missingAttributes = desired.attributes.filter((attribute) => !currentAttributes.has(attribute.key));
  for (const attribute of missingAttributes) {
    changes.push(`+ attribute ${attribute.key} (${attribute.kind}, required=${attribute.required})`);
  }
  for (const attribute of desired.attributes) {
    const existing = currentAttributes.get(attribute.key);
    if (existing && existing.type !== expectedType(attribute)) {
      warnings.push(`attribute ${attribute.key} is ${existing.type}, desired ${expectedType(attribute)} (left unchanged)`);
    }
  }

  const missingIndexes = desired.indexes.filter((index) => !currentIndexes.has(index.key));
  for (const index of missingIndexes) {
    changes.push(`+ index ${index.key} (${index.type}: ${index.attributes.join(', ')})`);
  }
  for (const index of desired.indexes) {
    const existing = currentIndexes.get(index.key);
    if (existing && show(existing.attributes) !== show(index.attributes)) {
      warnings.push(`index ${index.key} covers ${show(existing.attributes)}, desired ${show(index.attributes)} (left unchanged)`);
    }
  }

  return { changes, warnings, missingAttributes, missingIndexes };
}

function report(context, label, plan) {
  for (const warning of plan.warnings) console.warn(`  ! ${label}: ${warning}`);
  if (plan.changes.length === 0) {
    console.log(`= ${label} up to date`);
    return;
  }
  context.pendingChanges += plan.changes.length;
  console.log(`${context.apply ? '~' : '?'} ${label}`);
  for (const change of plan.changes) console.log(`    ${change}`);
}

async function createAttribute(context, collectionId, attribute) {
  const base = { databaseId: DATABASE_ID, collectionId, key: attribute.key, required: attribute.required };
  if (attribute.kind === 'string') {
    await context.databases.createStringAttribute({ ...base, size: attribute.size });
    return;
  }
  if (attribute.kind === 'boolean') {
    await context.databases.createBooleanAttribute(base);
    return;
  }
  if (attribute.kind === 'datetime') {
    await context.databases.createDatetimeAttribute(base);
    return;
  }
  if (attribute.kind === 'integer') {
    await context.databases.createIntegerAttribute({ ...base, min: attribute.min, max: attribute.max });
    return;
  }
  if (attribute.kind === 'enum') {
    await context.databases.createEnumAttribute({ ...base, elements: attribute.elements });
    return;
  }
  throw new Error(`Unsupported attribute kind ${attribute.kind} for ${collectionId}.${attribute.key}`);
}

async function waitForAttributes(context, collectionId, keys) {
  const deadline = Date.now() + ATTRIBUTE_WAIT_MS;
  while (Date.now() < deadline) {
    const collection = await context.databases.getCollection({ databaseId: DATABASE_ID, collectionId });
    const byKey = new Map(collection.attributes.map((attribute) => [attribute.key, attribute]));
    const pending = keys.filter((key) => byKey.get(key)?.status !== 'available');
    if (pending.length === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Attributes for ${collectionId} did not become available in time`);
}

export async function ensureCollection(context, definition) {
  const desired = { attributes: [], indexes: [], ...definition };
  const current = await findOrNull(() => context.databases.getCollection({ databaseId: DATABASE_ID, collectionId: desired.id }));
  if (!current && desired.mustExist) {
    console.warn(`  ! collection ${desired.id}: missing — this script only creates it when its full schema is codified`);
    return;
  }
  const plan = planCollection(current, desired);
  report(context, `collection ${desired.id}`, plan);
  if (!context.apply || plan.changes.length === 0) return;

  if (!current) {
    await ignoreConflict(() => context.databases.createCollection({
      databaseId: DATABASE_ID,
      collectionId: desired.id,
      name: desired.name,
      permissions: desired.permissions,
      documentSecurity: desired.documentSecurity,
      enabled: true,
    }));
  } else if (!samePermissions(current.$permissions, desired.permissions) || current.documentSecurity !== desired.documentSecurity) {
    await context.databases.updateCollection({
      databaseId: DATABASE_ID,
      collectionId: desired.id,
      name: current.name,
      permissions: desired.permissions,
      documentSecurity: desired.documentSecurity,
      enabled: current.enabled,
    });
  }

  for (const attribute of plan.missingAttributes) {
    await ignoreConflict(() => createAttribute(context, desired.id, attribute));
  }
  if (plan.missingAttributes.length > 0 || plan.missingIndexes.length > 0) {
    const indexedKeys = plan.missingIndexes.flatMap((index) => index.attributes);
    const keys = [...new Set([...plan.missingAttributes.map((attribute) => attribute.key), ...indexedKeys])];
    await waitForAttributes(context, desired.id, keys);
  }
  for (const index of plan.missingIndexes) {
    await ignoreConflict(() => context.databases.createIndex({
      databaseId: DATABASE_ID,
      collectionId: desired.id,
      key: index.key,
      type: index.type,
      attributes: index.attributes,
    }));
  }
  console.log(`  applied collection ${desired.id}`);
}

export function keyIndex(key, attributes) {
  return { key, type: DatabasesIndexType.Key, attributes };
}

function planBucket(current, desired) {
  const changes = [];
  if (!current) {
    changes.push(`create bucket permissions=${show(desired.permissions)} fileSecurity=${desired.fileSecurity}`);
    return { changes, warnings: [] };
  }
  if (!samePermissions(current.$permissions, desired.permissions)) {
    changes.push(`permissions ${show(current.$permissions)} -> ${show(desired.permissions)}`);
  }
  if (current.fileSecurity !== desired.fileSecurity) {
    changes.push(`fileSecurity ${current.fileSecurity} -> ${desired.fileSecurity}`);
  }
  return { changes, warnings: [] };
}

async function applyBucket(context, current, desired) {
  if (!current) {
    await ignoreConflict(() => context.storage.createBucket({
      bucketId: desired.id,
      name: desired.id,
      permissions: desired.permissions,
      fileSecurity: desired.fileSecurity,
      ...desired.createOptions,
    }));
    return;
  }
  await context.storage.updateBucket({
    bucketId: current.$id,
    name: current.name,
    permissions: desired.permissions,
    fileSecurity: desired.fileSecurity,
    enabled: current.enabled,
    maximumFileSize: current.maximumFileSize,
    allowedFileExtensions: current.allowedFileExtensions,
    compression: current.compression,
    encryption: current.encryption,
    antivirus: current.antivirus,
    transformations: current.transformations,
  });
}

export async function ensureBucket(context, desired) {
  if (!desired.permissions.includes(PUBLIC_FILE_READ)) {
    throw new Error(`Refusing to provision bucket ${desired.id} without ${PUBLIC_FILE_READ}`);
  }
  const label = `bucket ${desired.id}`;
  try {
    const current = await findOrNull(() => context.storage.getBucket({ bucketId: desired.id }));
    if (!current && !desired.createOptions) {
      console.warn(`  ! ${label}: missing — create it in the Appwrite console`);
      return;
    }
    const plan = planBucket(current, desired);
    report(context, label, plan);
    if (!context.apply || plan.changes.length === 0) return;
    await applyBucket(context, current, desired);
    console.log(`  applied ${label}`);
  } catch (error) {
    if (!isMissingScope(error)) throw error;
    console.warn(`  ! ${label}: API key lacks bucket scopes — review it in the Appwrite console`);
  }
}

export function finish(context) {
  if (context.apply) {
    console.log('done');
    return;
  }
  console.log(context.pendingChanges === 0
    ? 'dry-run: nothing to change'
    : `dry-run: ${context.pendingChanges} change(s) pending — re-run with --apply to apply them`);
}
