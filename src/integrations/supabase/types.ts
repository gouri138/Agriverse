export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      crops: {
        Row: {
          area_planted: number | null
          created_at: string
          crop_name: string
          expected_harvest_date: string | null
          id: string
          location_field: string | null
          planting_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          variety: string | null
        }
        Insert: {
          area_planted?: number | null
          created_at?: string
          crop_name: string
          expected_harvest_date?: string | null
          id?: string
          location_field?: string | null
          planting_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          variety?: string | null
        }
        Update: {
          area_planted?: number | null
          created_at?: string
          crop_name?: string
          expected_harvest_date?: string | null
          id?: string
          location_field?: string | null
          planting_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          variety?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          crop_id: string | null
          description: string | null
          expense_date: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          crop_id?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          crop_id?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_queries: {
        Row: {
          answered_at: string | null
          category: string | null
          created_at: string
          expert_response: string | null
          id: string
          images: string[] | null
          question: string
          status: string | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          category?: string | null
          created_at?: string
          expert_response?: string | null
          id?: string
          images?: string[] | null
          question: string
          status?: string | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          category?: string | null
          created_at?: string
          expert_response?: string | null
          id?: string
          images?: string[] | null
          question?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      irrigation_schedules: {
        Row: {
          created_at: string
          crop_id: string | null
          duration_minutes: number
          field_name: string
          frequency: string | null
          id: string
          is_active: boolean | null
          last_irrigated: string | null
          schedule_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_id?: string | null
          duration_minutes: number
          field_name: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_irrigated?: string | null
          schedule_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop_id?: string | null
          duration_minutes?: number
          field_name?: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_irrigated?: string | null
          schedule_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "irrigation_schedules_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          crop_type: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          price: number
          quantity: number
          region: string | null
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          crop_type?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price: number
          quantity: number
          region?: string | null
          title: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          crop_type?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number
          quantity?: number
          region?: string | null
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pest_reports: {
        Row: {
          ai_identification: Json | null
          created_at: string
          crop_id: string | null
          id: string
          image_url: string | null
          severity: string | null
          status: string | null
          user_description: string | null
          user_id: string
        }
        Insert: {
          ai_identification?: Json | null
          created_at?: string
          crop_id?: string | null
          id?: string
          image_url?: string | null
          severity?: string | null
          status?: string | null
          user_description?: string | null
          user_id: string
        }
        Update: {
          ai_identification?: Json | null
          created_at?: string
          crop_id?: string | null
          id?: string
          image_url?: string | null
          severity?: string | null
          status?: string | null
          user_description?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pest_reports_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          farm_name: string | null
          farm_size: number | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          primary_crops: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_name?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          farm_name?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_records: {
        Row: {
          buyer_name: string | null
          created_at: string
          crop_id: string | null
          id: string
          market_location: string | null
          price_per_unit: number
          quantity_sold: number
          sale_date: string
          total_amount: number
          user_id: string
        }
        Insert: {
          buyer_name?: string | null
          created_at?: string
          crop_id?: string | null
          id?: string
          market_location?: string | null
          price_per_unit: number
          quantity_sold: number
          sale_date?: string
          total_amount: number
          user_id: string
        }
        Update: {
          buyer_name?: string | null
          created_at?: string
          crop_id?: string | null
          id?: string
          market_location?: string | null
          price_per_unit?: number
          quantity_sold?: number
          sale_date?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_records_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          crop_name: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_name?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop_name?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          severity: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
