import type { Models } from 'node-appwrite';

/**
 * Hand-written Appwrite collection document interfaces (Phase 1: Auth + DB).
 *
 * These are the hand-written DB document types. They model the document
 * attributes as stored in Appwrite. Field names match the column names used
 * downstream, so PR-2 repositories can compose these docs into the existing
 * `JoinedProductRow` shape (`features/catalog/queries/mappers.ts`) with no
 * mapper changes.
 *
 * Each doc extends `Models.Document`, which provides `$id`, `$collectionId`,
 * `$databaseId`, `$createdAt`, `$updatedAt`, and `$permissions`.
 */

/** Arbitrary JSON value stored in flexible attributes (e.g. price_variants). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ProductDoc extends Models.Document {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  includes: string[];
  colors: string[];
  flower_types: string[];
  occasion: string | null;
  note: string | null;
  price_variants: JsonValue | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface CategoryDoc extends Models.Document {
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  occasion: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface ProductImageDoc extends Models.Document {
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface ColorDoc extends Models.Document {
  name: string;
  label: string;
  hex: string | null;
  display_order: number;
}

export interface FlowerTypeDoc extends Models.Document {
  name: string;
  display_order: number;
}

export interface ColorAssignmentDoc extends Models.Document {
  product_id: string;
  color_id: string;
}

export interface FlowerTypeAssignmentDoc extends Models.Document {
  product_id: string;
  flower_type_id: string;
}

export interface ComplaintDoc extends Models.Document {
  correlativo: number;
  complaint_type: string;
  consumer_name: string;
  consumer_doc_type: string;
  consumer_doc_number: string;
  consumer_email: string;
  consumer_phone: string | null;
  consumer_address: string;
  is_minor: boolean;
  guardian_name: string | null;
  item_type: string;
  item_description: string;
  claimed_amount: number | null;
  detail: string;
  consumer_request: string;
  provider_response: string | null;
  status: string;
  responded_at: string | null;
  email_sent: boolean;
}

/**
 * Single-document atomic counter keyed by year (`complaints-{YYYY}`). `value`
 * is mutated only via `databases.incrementDocumentAttribute` (server-atomic),
 * which guarantees gap-free, duplicate-free correlativos under concurrency.
 */
export interface CounterDoc extends Models.Document {
  value: number;
}

/**
 * Appwrite-composed equivalent of `JoinedProductRow`. PR-2 repositories build
 * this by batch-fetching assignments and images, so `mapProductRow` consumes it
 * unchanged. Shape matches the `JoinedProductRow` contract exactly.
 */
export interface JoinedProductDoc extends ProductDoc {
  product_color_assignments:
    | { product_colors: { name: string } | null }[]
    | null;
  product_flower_type_assignments:
    | { flower_types: { name: string } | null }[]
    | null;
  product_images:
    | {
        url: string;
        alt_text: string | null;
        is_primary: boolean;
        display_order: number;
      }[]
    | null;
}
