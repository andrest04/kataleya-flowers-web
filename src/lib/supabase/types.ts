// Auto-generated — do not edit manually
// Regenerate: npm run db:types (requires SUPABASE_ACCESS_TOKEN in env)

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
          is_featured: boolean;
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
          is_featured?: boolean;
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
          is_featured?: boolean;
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
          colors: string[];
          flower_types: string[];
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
          colors?: string[];
          flower_types?: string[];
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
          colors?: string[];
          flower_types?: string[];
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
      product_colors: {
        Row: {
          id: string;
          name: string;
          label: string;
          hex: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          label: string;
          hex?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          label?: string;
          hex?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      flower_types: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
    Functions: {
      get_event_type_counts: {
        Args: { p_since: string; p_until?: string };
        Returns: { event_type: string; source: string; count: number }[];
      };
      get_top_entities: {
        Args: { p_event_type: string; p_since: string; p_limit?: number };
        Returns: { entity_slug: string; count: number }[];
      };
      get_whatsapp_source_counts: {
        Args: { p_since: string };
        Returns: { source: string; count: number }[];
      };
      get_product_conversion_metrics: {
        Args: { p_since: string };
        Returns: { entity_slug: string; views: number; whatsapp_clicks: number }[];
      };
      get_inventory_status: {
        Args: Record<string, never>;
        Returns: { active: number; inactive: number; featured: number; total: number }[];
      };
      get_product_ids_with_views: {
        Args: { p_since: string };
        Returns: { entity_id: string }[];
      };
      get_active_category_ids: {
        Args: Record<string, never>;
        Returns: { category_id: string }[];
      };
      delete_category_cascade: {
        Args: { p_category_id: string };
        Returns: string[];
      };
      delete_category_reassign: {
        Args: { p_category_id: string; p_reassign_to: string };
        Returns: string;
      };
      reorder_categories: {
        Args: { p_ordered_ids: string[] };
        Returns: undefined;
      };
      reorder_products: {
        Args: { p_ordered_ids: string[] };
        Returns: undefined;
      };
      delete_flower_type: {
        Args: { p_name: string };
        Returns: undefined;
      };
      rename_flower_type: {
        Args: { p_old_name: string; p_new_name: string };
        Returns: undefined;
      };
      get_flower_type_usage: {
        Args: { p_name: string };
        Returns: { product_id: string; product_name: string }[];
      };
      delete_product_color: {
        Args: { p_name: string };
        Returns: undefined;
      };
      rename_product_color: {
        Args: { p_old_name: string; p_new_name: string };
        Returns: undefined;
      };
      get_product_color_usage: {
        Args: { p_name: string };
        Returns: { product_id: string; product_name: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
