export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      medicine_stock_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          medicine_id: string | null
          quantity: number
          stock_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          medicine_id?: string | null
          quantity: number
          stock_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          medicine_id?: string | null
          quantity?: number
          stock_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_stock_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_stock_history_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_usage: {
        Row: {
          created_by: string | null
          id: string
          medicine_id: string | null
          patient_id: string | null
          quantity_used: number
          usage_date: string | null
        }
        Insert: {
          created_by?: string | null
          id?: string
          medicine_id?: string | null
          patient_id?: string | null
          quantity_used: number
          usage_date?: string | null
        }
        Update: {
          created_by?: string | null
          id?: string
          medicine_id?: string | null
          patient_id?: string | null
          quantity_used?: number
          usage_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_usage_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_usage_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_usage_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          category: Database["public"]["Enums"]["medicine_category"]
          created_at: string | null
          expiry_date: string | null
          id: string
          last_updated: string | null
          name: string
          serial_number: number
          total_quantity: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["medicine_category"]
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_updated?: string | null
          name: string
          serial_number?: number
          total_quantity?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["medicine_category"]
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          serial_number?: number
          total_quantity?: number | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number
          created_by: string | null
          description: string | null
          gender: string
          id: string
          name: string
          patient_id: number
          phone_number: string | null
          registration_date: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age: number
          created_by?: string | null
          description?: string | null
          gender: string
          id?: string
          name: string
          patient_id?: number
          phone_number?: string | null
          registration_date?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number
          created_by?: string | null
          description?: string | null
          gender?: string
          id?: string
          name?: string
          patient_id?: number
          phone_number?: string | null
          registration_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string
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
      medicine_category: "tablet" | "syrup" | "injection"
      user_role: "admin" | "doctor" | "reception" | "pharmacy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      medicine_category: ["tablet", "syrup", "injection"],
      user_role: ["admin", "doctor", "reception", "pharmacy"],
    },
  },
} as const
