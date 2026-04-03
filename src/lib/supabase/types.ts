// Generado manualmente a partir de supabase/migrations/20260328000001_initial_schema.sql
// Para regenerar: SUPABASE_ACCESS_TOKEN=sbp_xxx npx supabase gen types typescript --project-id lhromzqzcssgdfguejje

export type ProductColor =
  | 'rojo'
  | 'rosa'
  | 'amarillo'
  | 'blanco'
  | 'morado'
  | 'naranja'
  | 'verde'
  | 'mixto';

export type ProductFlowerType =
  | 'rosas'
  | 'girasoles'
  | 'orquídeas'
  | 'astromelias'
  | 'lirios'
  | 'gerberas'
  | 'mixto';

export interface PriceVariantRow {
  label: string;
  price: number;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          occasion: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          occasion?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          occasion?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          image_url: string;
          occasion: string | null;
          note: string | null;
          colors: ProductColor[];
          flower_types: ProductFlowerType[];
          images: string[];
          includes: string[];
          price_variants: PriceVariantRow[] | null;
          display_order: number;
          is_active: boolean;
          is_featured: boolean;
          search_vector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          image_url: string;
          occasion?: string | null;
          note?: string | null;
          colors?: ProductColor[];
          flower_types?: ProductFlowerType[];
          images?: string[];
          includes?: string[];
          price_variants?: PriceVariantRow[] | null;
          display_order?: number;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          image_url?: string;
          occasion?: string | null;
          note?: string | null;
          colors?: ProductColor[];
          flower_types?: ProductFlowerType[];
          images?: string[];
          includes?: string[];
          price_variants?: PriceVariantRow[] | null;
          display_order?: number;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_events: {
        Row: {
          id: number;
          event_type: string;
          entity_type: string | null;
          entity_id: string | null;
          entity_slug: string | null;
          metadata: Record<string, string> | null;
          created_at: string;
        };
        Insert: {
          event_type: string;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_slug?: string | null;
          metadata?: Record<string, string> | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      category_price_summary: {
        Row: {
          category_id: string;
          price_from: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      product_color: ProductColor;
      product_flower_type: ProductFlowerType;
    };
    CompositeTypes: Record<string, never>;
  };
}
