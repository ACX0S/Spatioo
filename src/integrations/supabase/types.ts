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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          accepted_at: string | null
          arrival_confirmed_by_owner_at: string | null
          arrival_confirmed_by_user_at: string | null
          completed_at: string | null
          created_at: string | null
          date: string
          departure_confirmed_by_owner_at: string | null
          departure_confirmed_by_user_at: string | null
          end_time: string
          estacionamento_id: string
          expires_at: string | null
          id: string
          price: number
          rejected_at: string | null
          spot_number: string
          start_time: string
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          arrival_confirmed_by_owner_at?: string | null
          arrival_confirmed_by_user_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          date: string
          departure_confirmed_by_owner_at?: string | null
          departure_confirmed_by_user_at?: string | null
          end_time: string
          estacionamento_id: string
          expires_at?: string | null
          id?: string
          price: number
          rejected_at?: string | null
          spot_number: string
          start_time: string
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          arrival_confirmed_by_owner_at?: string | null
          arrival_confirmed_by_user_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          date?: string
          departure_confirmed_by_owner_at?: string | null
          departure_confirmed_by_user_at?: string | null
          end_time?: string
          estacionamento_id?: string
          expires_at?: string | null
          id?: string
          price?: number
          rejected_at?: string | null
          spot_number?: string
          start_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_estacionamento_id_fkey"
            columns: ["estacionamento_id"]
            isOneToOne: false
            referencedRelation: "estacionamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_estacionamento"
            columns: ["estacionamento_id"]
            isOneToOne: false
            referencedRelation: "estacionamento"
            referencedColumns: ["id"]
          },
        ]
      }
      estacionamento: {
        Row: {
          ativo: boolean
          cep: string
          cnpj: string
          created_at: string
          descricao: string | null
          endereco: string
          fotos: string[] | null
          funcionamento_24h: boolean | null
          hora_extra: number | null
          horario_funcionamento: Json
          id: string
          latitude: number | null
          longitude: number | null
          manobrista: boolean | null
          nome: string
          numero_vagas: number
          preco: number
          suporte_caminhao: boolean | null
          suporte_carro_eletrico: boolean | null
          tipo: string | null
          updated_at: string
          user_id: string
          vaga_coberta: boolean | null
          vaga_moto: boolean | null
        }
        Insert: {
          ativo?: boolean
          cep: string
          cnpj: string
          created_at?: string
          descricao?: string | null
          endereco: string
          fotos?: string[] | null
          funcionamento_24h?: boolean | null
          hora_extra?: number | null
          horario_funcionamento: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          manobrista?: boolean | null
          nome: string
          numero_vagas: number
          preco: number
          suporte_caminhao?: boolean | null
          suporte_carro_eletrico?: boolean | null
          tipo?: string | null
          updated_at?: string
          user_id: string
          vaga_coberta?: boolean | null
          vaga_moto?: boolean | null
        }
        Update: {
          ativo?: boolean
          cep?: string
          cnpj?: string
          created_at?: string
          descricao?: string | null
          endereco?: string
          fotos?: string[] | null
          funcionamento_24h?: boolean | null
          hora_extra?: number | null
          horario_funcionamento?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          manobrista?: boolean | null
          nome?: string
          numero_vagas?: number
          preco?: number
          suporte_caminhao?: boolean | null
          suporte_carro_eletrico?: boolean | null
          tipo?: string | null
          updated_at?: string
          user_id?: string
          vaga_coberta?: boolean | null
          vaga_moto?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "estacionamento_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estacionamento_precos: {
        Row: {
          created_at: string
          estacionamento_id: string
          horas: number
          id: string
          preco: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estacionamento_id: string
          horas: number
          id?: string
          preco: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estacionamento_id?: string
          horas?: number
          id?: string
          preco?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estacionamento_precos_estacionamento_id_fkey"
            columns: ["estacionamento_id"]
            isOneToOne: false
            referencedRelation: "estacionamento"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string
          estacionamento_id: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          estacionamento_id?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          estacionamento_id?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_estacionamento_id_fkey"
            columns: ["estacionamento_id"]
            isOneToOne: false
            referencedRelation: "estacionamento"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apelido: string | null
          avatar_url: string | null
          cep: string | null
          complement: string | null
          dono_estacionamento: boolean | null
          id: string
          name: string | null
          neighborhood: string | null
          number: string | null
          phone: string | null
          street: string | null
          updated_at: string | null
        }
        Insert: {
          apelido?: string | null
          avatar_url?: string | null
          cep?: string | null
          complement?: string | null
          dono_estacionamento?: boolean | null
          id: string
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Update: {
          apelido?: string | null
          avatar_url?: string | null
          cep?: string | null
          complement?: string | null
          dono_estacionamento?: boolean | null
          id?: string
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vagas: {
        Row: {
          booking_id: string | null
          created_at: string
          estacionamento_id: string
          id: string
          numero_vaga: string
          pagamento_realizado: boolean
          status: string
          tipo_vaga: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          estacionamento_id: string
          id?: string
          numero_vaga: string
          pagamento_realizado?: boolean
          status?: string
          tipo_vaga?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          estacionamento_id?: string
          id?: string
          numero_vaga?: string
          pagamento_realizado?: boolean
          status?: string
          tipo_vaga?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vagas_booking"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vagas_estacionamento"
            columns: ["estacionamento_id"]
            isOneToOne: false
            referencedRelation: "estacionamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vagas_estacionamento_id_fkey"
            columns: ["estacionamento_id"]
            isOneToOne: false
            referencedRelation: "estacionamento"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_book_today: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      expire_pending_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_vagas_stats: {
        Args: { estacionamento_id_param: string }
        Returns: {
          total_vagas: number
          vagas_disponiveis: number
          vagas_manutencao: number
          vagas_ocupadas: number
          vagas_reservadas: number
        }[]
      }
      user_owns_estacionamento: {
        Args: { estacionamento_id: string }
        Returns: boolean
      }
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
