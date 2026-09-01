import type { Models } from 'node-appwrite';

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

export interface CounterDoc extends Models.Document {
  value: number;
}

export type HeroCtaType = 'whatsapp' | 'catalogo' | 'url';

export interface HeroSlideDoc extends Models.Document {
  alt_text: string;
  cta_label: string | null;
  cta_type: HeroCtaType;
  cta_value: string | null;
  display_order: number;
  ends_at: string | null;
  focus: string | null;
  image_url: string;
  is_active: boolean;
  kicker: string;
  name: string | null;
  starts_at: string | null;
  subtitle: string | null;
  title: string;
}

export interface PromoBannerDoc extends Models.Document {
  content_position: 'top' | 'bottom';
  cta_external: boolean;
  cta_href: string;
  cta_label: string;
  description: string;
  display_order: number;
  ends_at: string | null;
  image_url: string;
  is_active: boolean;
  name: string | null;
  starts_at: string | null;
  title: string;
}

export interface TestimonialDoc extends Models.Document {
  display_order: number;
  ends_at: string | null;
  is_active: boolean;
  name: string;
  occasion: string;
  photo_alt: string;
  photo_url: string;
  quote: string;
  stars: number;
  starts_at: string | null;
}

export interface DiscoverTileDoc extends Models.Document {
  description: string;
  display_order: number;
  ends_at: string | null;
  href: string;
  icon: string;
  image_url: string;
  is_active: boolean;
  is_external: boolean;
  starts_at: string | null;
  title: string;
}

export interface ValuePropDoc extends Models.Document {
  description: string;
  display_order: number;
  ends_at: string | null;
  href: string;
  icon: string;
  is_active: boolean;
  is_anchor: boolean;
  is_external: boolean;
  link_label: string;
  starts_at: string | null;
  title: string;
}

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
