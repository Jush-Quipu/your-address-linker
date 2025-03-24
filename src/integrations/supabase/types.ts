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
      access_logs: {
        Row: {
          accessed_at: string
          accessed_fields: string[] | null
          id: string
          ip_address: string | null
          permission_id: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_fields?: string[] | null
          id?: string
          ip_address?: string | null
          permission_id: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_fields?: string[] | null
          id?: string
          ip_address?: string | null
          permission_id?: string
          user_agent?: string | null
        }
      }
      address_permissions: {
        Row: {
          access_expiry: string | null
          access_token: string
          app_id: string
          app_name: string
          created_at: string
          id: string
          last_accessed: string | null
          share_city: boolean
          share_country: boolean
          share_postal_code: boolean
          share_state: boolean
          share_street: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          access_expiry?: string | null
          access_token: string
          app_id: string
          app_name: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          share_city?: boolean
          share_country?: boolean
          share_postal_code?: boolean
          share_state?: boolean
          share_street?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          access_expiry?: string | null
          access_token?: string
          app_id?: string
          app_name?: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          share_city?: boolean
          share_country?: boolean
          share_postal_code?: boolean
          share_state?: boolean
          share_street?: boolean
          updated_at?: string
          user_id?: string
        }
      }
      physical_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          postal_code: string
          state: string
          street_address: string
          updated_at: string
          user_id: string
          verification_date: string | null
          verification_method: string | null
          verification_status: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          postal_code: string
          state: string
          street_address: string
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_privacy_settings: Json | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_privacy_settings?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_privacy_settings?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
      }
      wallet_addresses: {
        Row: {
          address: string
          chain_id: number
          created_at: string
          id: string
          is_primary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          chain_id: number
          created_at?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          chain_id?: number
          created_at?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id?: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
