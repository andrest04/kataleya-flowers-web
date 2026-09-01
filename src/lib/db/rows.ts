export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface CategoryRow {
  created_at: string;
  description: string;
  display_order: number;
  id: string;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  name: string;
  occasion: string | null;
  slug: string;
  updated_at: string;
}

export interface ProductRow {
  category_id: string;
  colors: string[];
  created_at: string;
  description: string;
  display_order: number;
  flower_types: string[];
  id: string;
  image_url: string;
  images: string[];
  includes: Json;
  is_active: boolean;
  is_featured: boolean;
  name: string;
  note: string | null;
  occasion: string | null;
  price: number;
  price_variants: Json | null;
  search_vector: unknown;
  slug: string;
  updated_at: string;
}

export interface ProductColorRow {
  created_at: string;
  display_order: number;
  hex: string | null;
  id: string;
  label: string;
  name: string;
  updated_at: string;
}

export interface FlowerTypeRow {
  created_at: string;
  display_order: number;
  id: string;
  name: string;
  updated_at: string;
}

export type HeroCtaType = 'whatsapp' | 'catalogo' | 'url';

export interface HeroSlideRow {
  alt_text: string;
  cta_label: string | null;
  cta_type: HeroCtaType;
  cta_value: string | null;
  display_order: number;
  ends_at: string | null;
  focus: string | null;
  id: string;
  image_url: string;
  is_active: boolean;
  kicker: string;
  name: string | null;
  starts_at: string | null;
  subtitle: string | null;
  title: string;
}

export interface PromoBannerRow {
  content_position: 'top' | 'bottom';
  cta_external: boolean;
  cta_href: string;
  cta_label: string;
  description: string;
  display_order: number;
  ends_at: string | null;
  id: string;
  image_url: string;
  is_active: boolean;
  name: string | null;
  starts_at: string | null;
  title: string;
}

export interface TestimonialRow {
  display_order: number;
  ends_at: string | null;
  id: string;
  is_active: boolean;
  name: string;
  occasion: string;
  photo_alt: string;
  photo_url: string;
  quote: string;
  stars: number;
  starts_at: string | null;
}

export interface DiscoverTileRow {
  description: string;
  display_order: number;
  ends_at: string | null;
  href: string;
  icon: string;
  id: string;
  image_url: string;
  is_active: boolean;
  is_external: boolean;
  starts_at: string | null;
  title: string;
}

export interface ValuePropRow {
  description: string;
  display_order: number;
  ends_at: string | null;
  href: string;
  icon: string;
  id: string;
  is_active: boolean;
  is_anchor: boolean;
  is_external: boolean;
  link_label: string;
  starts_at: string | null;
  title: string;
}

export interface SiteSettingsRow {
  address: string;
  announcement_cta_href: string;
  announcement_cta_label: string;
  announcement_ends_at: string | null;
  announcement_is_active: boolean;
  announcement_starts_at: string | null;
  announcement_text: string;
  bestsellers_title: string;
  catalog_title: string;
  contact_title: string;
  discover_title: string;
  email: string;
  hours_closes: string;
  hours_open_days: string;
  hours_opens: string;
  hours_time: string;
  hours_weekdays: string;
  id: string;
  instagram_handle: string;
  location: string;
  maps_embed_url: string;
  phone: string;
  razon_social: string;
  ruc: string;
  whatsapp_default: string;
  whatsapp_float: string;
  whatsapp_product: string;
}

export interface ComplaintRow {
  claimed_amount: number | null;
  complaint_type: string;
  consumer_address: string;
  consumer_doc_number: string;
  consumer_doc_type: string;
  consumer_email: string;
  consumer_name: string;
  consumer_phone: string | null;
  consumer_request: string;
  correlativo: number;
  created_at: string;
  detail: string;
  email_sent: boolean;
  guardian_name: string | null;
  id: string;
  is_minor: boolean;
  item_description: string;
  item_type: string;
  provider_response: string | null;
  responded_at: string | null;
  status: string;
  updated_at: string;
}
