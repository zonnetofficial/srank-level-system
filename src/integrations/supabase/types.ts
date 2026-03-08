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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dark_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dp_packages: {
        Row: {
          bonus_points: number
          created_at: string
          dark_points: number
          icon: string
          id: string
          is_active: boolean
          name: string
          price_mxn: number
        }
        Insert: {
          bonus_points?: number
          created_at?: string
          dark_points: number
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          price_mxn: number
        }
        Update: {
          bonus_points?: number
          created_at?: string
          dark_points?: number
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          price_mxn?: number
        }
        Relationships: []
      }
      dp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          buyer_id: string | null
          created_at: string
          dp_amount: number | null
          id: string
          item_id: string | null
          listing_type: string
          price: number
          seller_id: string
          sold_at: string | null
          status: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          dp_amount?: number | null
          id?: string
          item_id?: string | null
          listing_type?: string
          price: number
          seller_id: string
          sold_at?: string | null
          status?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          dp_amount?: number | null
          id?: string
          item_id?: string | null
          listing_type?: string
          price?: number
          seller_id?: string
          sold_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      monarch_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          mp_payment_id: string | null
          reason: string | null
          status: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          mp_payment_id?: string | null
          reason?: string | null
          status?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          mp_payment_id?: string | null
          reason?: string | null
          status?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monarch_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "monarch_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      monarch_subscriptions: {
        Row: {
          blocked_until: string | null
          created_at: string
          id: string
          mp_payer_email: string | null
          mp_preapproval_id: string | null
          penalty_amount: number
          status: string
          streak_at_entry: number
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          id?: string
          mp_payer_email?: string | null
          mp_preapproval_id?: string | null
          penalty_amount?: number
          status?: string
          streak_at_entry?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          id?: string
          mp_payer_email?: string | null
          mp_preapproval_id?: string | null
          penalty_amount?: number
          status?: string
          streak_at_entry?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          effect_type: string | null
          effect_value: number | null
          icon: string
          id: string
          is_active: boolean
          max_per_user: number | null
          name: string
          price: number
          rarity: string
          stock: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          effect_type?: string | null
          effect_value?: number | null
          icon?: string
          id?: string
          is_active?: boolean
          max_per_user?: number | null
          name: string
          price: number
          rarity?: string
          stock?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          effect_type?: string | null
          effect_value?: number | null
          icon?: string
          id?: string
          is_active?: boolean
          max_per_user?: number | null
          name?: string
          price?: number
          rarity?: string
          stock?: number | null
        }
        Relationships: []
      }
      t_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tp_packages: {
        Row: {
          bonus_points: number
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          price_mxn: number
          t_points: number
        }
        Insert: {
          bonus_points?: number
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          price_mxn: number
          t_points: number
        }
        Update: {
          bonus_points?: number
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          price_mxn?: number
          t_points?: number
        }
        Relationships: []
      }
      tp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          acquired_at: string
          id: string
          item_id: string
          quantity: number
          source: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          item_id: string
          quantity?: number
          source?: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          item_id?: string
          quantity?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
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
