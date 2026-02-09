export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_assignments: {
        Row: {
          assigned_at: string | null
          customer_id: string
          id: string
          notes: string | null
          status: string | null
          team_member_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          status?: string | null
          team_member_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          team_member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          avg_cost: number
          created_at: string | null
          id: string
          name: string
          shares: number
          ticker: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_cost: number
          created_at?: string | null
          id?: string
          name: string
          shares: number
          ticker: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_cost?: number
          created_at?: string | null
          id?: string
          name?: string
          shares?: number
          ticker?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      holdings_v2: {
        Row: {
          account_id: string
          avg_cost: number | null
          category: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          exchange: string | null
          id: string
          isin: string | null
          name: string
          owner_comment: string | null
          sector: string | null
          shares: number | null
          ticker: string
          ticker_eod: string | null
          ticker_finnhub: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          avg_cost?: number | null
          category?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          id?: string
          isin?: string | null
          name: string
          owner_comment?: string | null
          sector?: string | null
          shares?: number | null
          ticker: string
          ticker_eod?: string | null
          ticker_finnhub?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          avg_cost?: number | null
          category?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          id?: string
          isin?: string | null
          name?: string
          owner_comment?: string | null
          sector?: string | null
          shares?: number | null
          ticker?: string
          ticker_eod?: string | null
          ticker_finnhub?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investor_profiles: {
        Row: {
          additional_notes: string | null
          created_at: string | null
          exclusion_criteria: string[] | null
          id: string
          investment_horizon: string | null
          preferred_metric: string | null
          preferred_metrics: string[] | null
          risk_tolerance: number | null
          system_prompt: string | null
          updated_at: string | null
          user_id: string
          warning_level: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string | null
          exclusion_criteria?: string[] | null
          id?: string
          investment_horizon?: string | null
          preferred_metric?: string | null
          preferred_metrics?: string[] | null
          risk_tolerance?: number | null
          system_prompt?: string | null
          updated_at?: string | null
          user_id: string
          warning_level?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string | null
          exclusion_criteria?: string[] | null
          id?: string
          investment_horizon?: string | null
          preferred_metric?: string | null
          preferred_metrics?: string[] | null
          risk_tolerance?: number | null
          system_prompt?: string | null
          updated_at?: string | null
          user_id?: string
          warning_level?: string | null
        }
        Relationships: []
      }
      investor_profiles_v2: {
        Row: {
          account_id: string
          action_frequency: number | null
          buy_box_triggers: string[] | null
          created_at: string | null
          data_granularity: number | null
          decision_logic: number | null
          id: string
          investment_philosophy: string | null
          noise_filters: string[] | null
          risk_appetite: number | null
          system_prompt: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          action_frequency?: number | null
          buy_box_triggers?: string[] | null
          created_at?: string | null
          data_granularity?: number | null
          decision_logic?: number | null
          id?: string
          investment_philosophy?: string | null
          noise_filters?: string[] | null
          risk_appetite?: number | null
          system_prompt?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          action_frequency?: number | null
          buy_box_triggers?: string[] | null
          created_at?: string | null
          data_granularity?: number | null
          decision_logic?: number | null
          id?: string
          investment_philosophy?: string | null
          noise_filters?: string[] | null
          risk_appetite?: number | null
          system_prompt?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          correction: string | null
          created_at: string | null
          feedback: string | null
          id: string
          metadata: Json | null
          role: string
          type: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          correction?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          metadata?: Json | null
          role: string
          type?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          correction?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_complete: boolean | null
          product_interval: string | null
          product_type: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_complete?: boolean | null
          product_interval?: string | null
          product_type?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_complete?: boolean | null
          product_interval?: string | null
          product_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
