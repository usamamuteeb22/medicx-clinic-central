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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      medicine_prescriptions: {
        Row: {
          afternoon: boolean | null
          created_at: string | null
          evening: boolean | null
          id: string
          medicine_id: string | null
          morning: boolean | null
          night: boolean | null
          patient_report_id: string | null
          quantity: number
        }
        Insert: {
          afternoon?: boolean | null
          created_at?: string | null
          evening?: boolean | null
          id?: string
          medicine_id?: string | null
          morning?: boolean | null
          night?: boolean | null
          patient_report_id?: string | null
          quantity: number
        }
        Update: {
          afternoon?: boolean | null
          created_at?: string | null
          evening?: boolean | null
          id?: string
          medicine_id?: string | null
          morning?: boolean | null
          night?: boolean | null
          patient_report_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicine_prescriptions_patient_report_id_fkey"
            columns: ["patient_report_id"]
            isOneToOne: false
            referencedRelation: "patient_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_stock_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          medicine_id: string | null
          quantity: number
          stock_type: string
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          medicine_id?: string | null
          quantity: number
          stock_type: string
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          medicine_id?: string | null
          quantity?: number
          stock_type?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_stock_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      patient_reports: {
        Row: {
          blood_pressure: string | null
          clinical_complaint: string | null
          created_at: string | null
          created_by: string | null
          created_by_role: string | null
          doctor_completed_at: string | null
          hemoglobin: number | null
          id: string
          medical_history: string | null
          observations: string | null
          patient_id: string
          platelets: number | null
          reception_completed_at: string | null
          recommendations: string | null
          report_date: string | null
          temperature: number | null
          wbc: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure?: string | null
          clinical_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_role?: string | null
          doctor_completed_at?: string | null
          hemoglobin?: number | null
          id?: string
          medical_history?: string | null
          observations?: string | null
          patient_id: string
          platelets?: number | null
          reception_completed_at?: string | null
          recommendations?: string | null
          report_date?: string | null
          temperature?: number | null
          wbc?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure?: string | null
          clinical_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_role?: string | null
          doctor_completed_at?: string | null
          hemoglobin?: number | null
          id?: string
          medical_history?: string | null
          observations?: string | null
          patient_id?: string
          platelets?: number | null
          reception_completed_at?: string | null
          recommendations?: string | null
          report_date?: string | null
          temperature?: number | null
          wbc?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
    }
    Enums: {
      medicine_category:
        | "tablet"
        | "syrup"
        | "injection"
        | "sachet"
        | "drops"
        | "lotion"
        | "cream"
        | "ointment"
        | "suspension"
        | "gel"
        | "infusion"
        | "transfusion"
      user_role: "admin" | "doctor" | "reception" | "pharmacy"
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
      medicine_category: [
        "tablet",
        "syrup",
        "injection",
        "sachet",
        "drops",
        "lotion",
        "cream",
        "ointment",
        "suspension",
        "gel",
        "infusion",
        "transfusion",
      ],
      user_role: ["admin", "doctor", "reception", "pharmacy"],
    },
  },
} as const
