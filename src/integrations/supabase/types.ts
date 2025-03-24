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
        Relationships: [
          {
            foreignKeyName: "access_logs_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "address_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      address_permissions: {
        Row: {
          access_count: number | null
          access_expiry: string | null
          access_notification: boolean | null
          access_token: string
          app_id: string
          app_name: string
          created_at: string
          id: string
          last_accessed: string | null
          last_notification_at: string | null
          max_access_count: number | null
          metadata: Json | null
          revocation_reason: string | null
          revoked: boolean | null
          revoked_at: string | null
          share_city: boolean
          share_country: boolean
          share_postal_code: boolean
          share_state: boolean
          share_street: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          access_expiry?: string | null
          access_notification?: boolean | null
          access_token: string
          app_id: string
          app_name: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          last_notification_at?: string | null
          max_access_count?: number | null
          metadata?: Json | null
          revocation_reason?: string | null
          revoked?: boolean | null
          revoked_at?: string | null
          share_city?: boolean
          share_country?: boolean
          share_postal_code?: boolean
          share_state?: boolean
          share_street?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          access_expiry?: string | null
          access_notification?: boolean | null
          access_token?: string
          app_id?: string
          app_name?: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          last_notification_at?: string | null
          max_access_count?: number | null
          metadata?: Json | null
          revocation_reason?: string | null
          revoked?: boolean | null
          revoked_at?: string | null
          share_city?: boolean
          share_country?: boolean
          share_postal_code?: boolean
          share_state?: boolean
          share_street?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      carrier_credentials: {
        Row: {
          carrier_id: string
          created_at: string
          credentials: Json
          id: string
          updated_at: string
          use_test_mode: boolean
        }
        Insert: {
          carrier_id: string
          created_at?: string
          credentials: Json
          id?: string
          updated_at?: string
          use_test_mode?: boolean
        }
        Update: {
          carrier_id?: string
          created_at?: string
          credentials?: Json
          id?: string
          updated_at?: string
          use_test_mode?: boolean
        }
        Relationships: []
      }
      developer_apps: {
        Row: {
          app_name: string
          app_secret: string | null
          callback_urls: string[]
          created_at: string
          description: string | null
          id: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          app_name: string
          app_secret?: string | null
          callback_urls: string[]
          created_at?: string
          description?: string | null
          id: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          app_name?: string
          app_secret?: string | null
          callback_urls?: string[]
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      encryption_keys: {
        Row: {
          active: boolean
          created_at: string
          id: string
          key_type: string
          public_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          key_type?: string
          public_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          key_type?: string
          public_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      physical_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          encrypted_city: string | null
          encrypted_country: string | null
          encrypted_postal_code: string | null
          encrypted_state: string | null
          encrypted_street_address: string | null
          encryption_nonce: string | null
          encryption_public_key: string | null
          encryption_version: number | null
          id: string
          postal_code: string
          state: string
          street_address: string
          updated_at: string
          user_id: string
          verification_date: string | null
          verification_method: string | null
          verification_status: string
          zkp_created_at: string | null
          zkp_proof: string | null
          zkp_public_inputs: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          encrypted_city?: string | null
          encrypted_country?: string | null
          encrypted_postal_code?: string | null
          encrypted_state?: string | null
          encrypted_street_address?: string | null
          encryption_nonce?: string | null
          encryption_public_key?: string | null
          encryption_version?: number | null
          id?: string
          postal_code: string
          state: string
          street_address: string
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string
          zkp_created_at?: string | null
          zkp_proof?: string | null
          zkp_public_inputs?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          encrypted_city?: string | null
          encrypted_country?: string | null
          encrypted_postal_code?: string | null
          encrypted_state?: string | null
          encrypted_street_address?: string | null
          encryption_nonce?: string | null
          encryption_public_key?: string | null
          encryption_version?: number | null
          id?: string
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string
          zkp_created_at?: string | null
          zkp_proof?: string | null
          zkp_public_inputs?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string
          carrier_details: Json | null
          confirmation_required: boolean | null
          confirmation_status: string | null
          created_at: string
          id: string
          package_details: Json | null
          permission_id: string
          service: string
          status: string
          tracking_details: Json | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier: string
          carrier_details?: Json | null
          confirmation_required?: boolean | null
          confirmation_status?: string | null
          created_at?: string
          id?: string
          package_details?: Json | null
          permission_id: string
          service: string
          status?: string
          tracking_details?: Json | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier?: string
          carrier_details?: Json | null
          confirmation_required?: boolean | null
          confirmation_status?: string | null
          created_at?: string
          id?: string
          package_details?: Json | null
          permission_id?: string
          service?: string
          status?: string
          tracking_details?: Json | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "address_permissions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      zkp_verifications: {
        Row: {
          id: string
          is_valid: boolean
          physical_address_id: string
          verification_data: Json | null
          verification_type: string
          verified_at: string
          verifier_app_id: string
        }
        Insert: {
          id?: string
          is_valid: boolean
          physical_address_id: string
          verification_data?: Json | null
          verification_type: string
          verified_at?: string
          verifier_app_id: string
        }
        Update: {
          id?: string
          is_valid?: boolean
          physical_address_id?: string
          verification_data?: Json | null
          verification_type?: string
          verified_at?: string
          verifier_app_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zkp_verifications_physical_address_id_fkey"
            columns: ["physical_address_id"]
            isOneToOne: false
            referencedRelation: "physical_addresses"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
