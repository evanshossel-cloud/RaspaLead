export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_theme: "dark" | "light" | "yellow";
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_theme?: "dark" | "light" | "yellow";
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_theme?: "dark" | "light" | "yellow";
          locale?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          brand_name: string | null;
          brand_logo_url: string | null;
          brand_primary_color: string | null;
          default_offer: string | null;
          default_target_audience: string | null;
          plan_id: string | null;
          current_period_starts_at: string;
          current_period_ends_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          brand_name?: string | null;
          brand_logo_url?: string | null;
          brand_primary_color?: string | null;
          default_offer?: string | null;
          default_target_audience?: string | null;
          plan_id?: string | null;
          current_period_starts_at?: string;
          current_period_ends_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          brand_name?: string | null;
          brand_logo_url?: string | null;
          brand_primary_color?: string | null;
          default_offer?: string | null;
          default_target_audience?: string | null;
          plan_id?: string | null;
          current_period_starts_at?: string;
          current_period_ends_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member" | "viewer";
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          role?: "owner" | "admin" | "member" | "viewer";
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          price_brl: number;
          monthly_credit_quota: number;
          auto_enrich_top_n: number;
          max_searches_per_month: number | null;
          features: Json;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          price_brl?: number;
          monthly_credit_quota: number;
          auto_enrich_top_n?: number;
          max_searches_per_month?: number | null;
          features?: Json;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          price_brl?: number;
          monthly_credit_quota?: number;
          auto_enrich_top_n?: number;
          max_searches_per_month?: number | null;
          features?: Json;
          is_active?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          plan_id: string;
          status: "active" | "past_due" | "canceled" | "trialing";
          started_at: string;
          current_period_start: string;
          current_period_end: string;
          canceled_at: string | null;
          external_provider: string | null;
          external_subscription_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          plan_id: string;
          status?: "active" | "past_due" | "canceled" | "trialing";
          started_at?: string;
          current_period_start?: string;
          current_period_end?: string;
          canceled_at?: string | null;
          external_provider?: string | null;
          external_subscription_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "active" | "past_due" | "canceled" | "trialing";
          current_period_start?: string;
          current_period_end?: string;
          canceled_at?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      lead_searches: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          name: string;
          state: string | null;
          city: string | null;
          neighborhood: string | null;
          niche: string | null;
          keyword: string | null;
          quantity_requested: number;
          user_offer: string | null;
          target_customer_profile: string | null;
          scoring_strategy: string;
          status: "pending" | "processing" | "enriching" | "completed" | "failed" | "canceled";
          progress: number;
          quantity_found: number;
          quantity_enriched: number;
          inngest_run_id: string | null;
          error_message: string | null;
          provider: string | null;
          processing_metadata: Json | null;
          created_at: string;
          started_at: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          name: string;
          state?: string | null;
          city?: string | null;
          neighborhood?: string | null;
          niche?: string | null;
          keyword?: string | null;
          quantity_requested?: number;
          user_offer?: string | null;
          target_customer_profile?: string | null;
          scoring_strategy?: string;
          status?: "pending" | "processing" | "enriching" | "completed" | "failed" | "canceled";
          progress?: number;
          quantity_found?: number;
          quantity_enriched?: number;
          inngest_run_id?: string | null;
          error_message?: string | null;
          provider?: string | null;
          processing_metadata?: Json | null;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Update: {
          name?: string;
          status?: "pending" | "processing" | "enriching" | "completed" | "failed" | "canceled";
          progress?: number;
          quantity_found?: number;
          quantity_enriched?: number;
          inngest_run_id?: string | null;
          error_message?: string | null;
          provider?: string | null;
          processing_metadata?: Json | null;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          workspace_id: string;
          search_id: string | null;
          place_id: string | null;
          company_name: string;
          category: string | null;
          phone: string | null;
          phone_normalized: string | null;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          google_maps_url: string | null;
          address: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          latitude: number | null;
          longitude: number | null;
          rating: number | null;
          review_count: number | null;
          raw_score: number;
          final_score: number;
          status: "new" | "selected" | "message_ready" | "message_sent" | "replied" | "interested" | "meeting_scheduled" | "closed_won" | "closed_lost";
          enrichment_status: "not_enriched" | "queued" | "processing" | "enriched" | "failed" | "skipped";
          enrichment_requested_at: string | null;
          enriched_at: string | null;
          enrichment_error: string | null;
          ai_summary: string | null;
          ai_first_message: string | null;
          ai_followup_message: string | null;
          ai_message_status: "not_generated" | "queued" | "processing" | "generated" | "failed";
          ai_message_requested_at: string | null;
          ai_message_generated_at: string | null;
          ai_message_error: string | null;
          source: string | null;
          source_keyword: string | null;
          dedup_hash: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          search_id?: string | null;
          place_id?: string | null;
          company_name: string;
          category?: string | null;
          phone?: string | null;
          phone_normalized?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          google_maps_url?: string | null;
          address?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          rating?: number | null;
          review_count?: number | null;
          raw_score?: number;
          final_score?: number;
          status?: "new" | "selected" | "message_ready" | "message_sent" | "replied" | "interested" | "meeting_scheduled" | "closed_won" | "closed_lost";
          enrichment_status?: "not_enriched" | "queued" | "processing" | "enriched" | "failed" | "skipped";
          enrichment_requested_at?: string | null;
          enriched_at?: string | null;
          enrichment_error?: string | null;
          ai_summary?: string | null;
          ai_first_message?: string | null;
          ai_followup_message?: string | null;
          ai_message_status?: "not_generated" | "queued" | "processing" | "generated" | "failed";
          ai_message_requested_at?: string | null;
          ai_message_generated_at?: string | null;
          ai_message_error?: string | null;
          source?: string | null;
          source_keyword?: string | null;
          dedup_hash?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          place_id?: string | null;
          phone?: string | null;
          website?: string | null;
          google_maps_url?: string | null;
          address?: string | null;
          rating?: number | null;
          review_count?: number | null;
          raw_score?: number;
          final_score?: number;
          status?: "new" | "selected" | "message_ready" | "message_sent" | "replied" | "interested" | "meeting_scheduled" | "closed_won" | "closed_lost";
          enrichment_status?: "not_enriched" | "queued" | "processing" | "enriched" | "failed" | "skipped";
          enrichment_requested_at?: string | null;
          enriched_at?: string | null;
          enrichment_error?: string | null;
          ai_summary?: string | null;
          ai_first_message?: string | null;
          ai_followup_message?: string | null;
          ai_message_status?: "not_generated" | "queued" | "processing" | "generated" | "failed";
          ai_message_requested_at?: string | null;
          ai_message_generated_at?: string | null;
          ai_message_error?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lead_enrichments: {
        Row: {
          id: string;
          lead_id: string;
          workspace_id: string;
          website_status: number | null;
          website_response_time_ms: number | null;
          website_final_url: string | null;
          website_has_ssl: boolean | null;
          website_has_meta_viewport: boolean | null;
          website_title: string | null;
          website_description: string | null;
          website_copyright_year: number | null;
          website_quality_score: number | null;
          phone_valid: boolean | null;
          whatsapp_likely: boolean | null;
          last_google_review_at: string | null;
          review_recency_score: number | null;
          raw_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          workspace_id: string;
          website_status?: number | null;
          website_response_time_ms?: number | null;
          website_final_url?: string | null;
          website_has_ssl?: boolean | null;
          website_has_meta_viewport?: boolean | null;
          website_title?: string | null;
          website_description?: string | null;
          website_copyright_year?: number | null;
          website_quality_score?: number | null;
          phone_valid?: boolean | null;
          whatsapp_likely?: boolean | null;
          last_google_review_at?: string | null;
          review_recency_score?: number | null;
          raw_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          website_status?: number | null;
          website_quality_score?: number | null;
          phone_valid?: boolean | null;
          whatsapp_likely?: boolean | null;
          raw_data?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          action_type: "lead_search_created" | "lead_search_result" | "lead_enrichment" | "ai_message" | "export" | "campaign_message_sent";
          credits_consumed: number;
          related_search_id: string | null;
          related_lead_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          action_type: "lead_search_created" | "lead_search_result" | "lead_enrichment" | "ai_message" | "export" | "campaign_message_sent";
          credits_consumed?: number;
          related_search_id?: string | null;
          related_lead_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          [_ in never]: never;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_workspace_credits_balance: {
        Args: { p_workspace_id: string };
        Returns: number;
      };
      user_workspace_ids: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
