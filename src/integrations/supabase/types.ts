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
      access_tokens: {
        Row: {
          app_id: string
          created_at: string
          expires_at: string
          id: string
          last_used_at: string | null
          previous_token_id: string | null
          refresh_token: string
          refresh_token_expires_at: string
          revoked: boolean
          revoked_at: string | null
          scope: string
          token: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          expires_at: string
          id?: string
          last_used_at?: string | null
          previous_token_id?: string | null
          refresh_token: string
          refresh_token_expires_at?: string
          revoked?: boolean
          revoked_at?: string | null
          scope: string
          token: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_used_at?: string | null
          previous_token_id?: string | null
          refresh_token?: string
          refresh_token_expires_at?: string
          revoked?: boolean
          revoked_at?: string | null
          scope?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_tokens_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "developer_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_tokens_previous_token_id_fkey"
            columns: ["previous_token_id"]
            isOneToOne: false
            referencedRelation: "access_tokens"
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
      address_verification_logs: {
        Row: {
          document_type: string | null
          id: string
          metadata: Json | null
          physical_address_id: string
          status: string
          user_id: string
          verification_date: string
          verification_type: string
        }
        Insert: {
          document_type?: string | null
          id?: string
          metadata?: Json | null
          physical_address_id: string
          status: string
          user_id: string
          verification_date?: string
          verification_type: string
        }
        Update: {
          document_type?: string | null
          id?: string
          metadata?: Json | null
          physical_address_id?: string
          status?: string
          user_id?: string
          verification_date?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_verification_logs_physical_address_id_fkey"
            columns: ["physical_address_id"]
            isOneToOne: false
            referencedRelation: "physical_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key: string
          last_used: string | null
          name: string
          revoked: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          last_used?: string | null
          name: string
          revoked?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          last_used?: string | null
          name?: string
          revoked?: boolean
          user_id?: string
        }
        Relationships: []
      }
      api_quota_usage: {
        Row: {
          app_id: string
          id: string
          last_updated: string
          month: string
          request_count: number
        }
        Insert: {
          app_id: string
          id?: string
          last_updated?: string
          month: string
          request_count?: number
        }
        Update: {
          app_id?: string
          id?: string
          last_updated?: string
          month?: string
          request_count?: number
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          method: string
          requests_per_hour: number
          requests_per_minute: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          method: string
          requests_per_hour?: number
          requests_per_minute?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          requests_per_hour?: number
          requests_per_minute?: number
          updated_at?: string
        }
        Relationships: []
      }
      authorization_codes: {
        Row: {
          app_id: string
          code: string
          created_at: string
          expires_at: string
          id: string
          redirect_uri: string
          scope: string
          state: string | null
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          app_id: string
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          redirect_uri: string
          scope: string
          state?: string | null
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          redirect_uri?: string
          scope?: string
          state?: string | null
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "authorization_codes_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "developer_apps"
            referencedColumns: ["id"]
          },
        ]
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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      developer_api_usage: {
        Row: {
          app_id: string
          created_at: string
          endpoint: string
          execution_time_ms: number | null
          id: string
          ip_address: string | null
          method: string
          response_status: number
          user_id: string | null
        }
        Insert: {
          app_id: string
          created_at?: string
          endpoint: string
          execution_time_ms?: number | null
          id?: string
          ip_address?: string | null
          method: string
          response_status: number
          user_id?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string
          endpoint?: string
          execution_time_ms?: number | null
          id?: string
          ip_address?: string | null
          method?: string
          response_status?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_api_usage_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "developer_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_app_secrets: {
        Row: {
          app_id: string
          app_secret: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          app_id: string
          app_secret: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          app_id?: string
          app_secret?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "developer_app_secrets_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "developer_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_apps: {
        Row: {
          app_name: string
          app_secret: string | null
          callback_urls: string[]
          created_at: string
          description: string | null
          id: string
          monthly_request_limit: number | null
          oauth_settings: Json | null
          status: Database["public"]["Enums"]["app_status"] | null
          updated_at: string | null
          user_id: string
          verification_details: Json | null
          verification_status:
            | Database["public"]["Enums"]["app_verification_status"]
            | null
          website_url: string | null
        }
        Insert: {
          app_name: string
          app_secret?: string | null
          callback_urls: string[]
          created_at?: string
          description?: string | null
          id: string
          monthly_request_limit?: number | null
          oauth_settings?: Json | null
          status?: Database["public"]["Enums"]["app_status"] | null
          updated_at?: string | null
          user_id: string
          verification_details?: Json | null
          verification_status?:
            | Database["public"]["Enums"]["app_verification_status"]
            | null
          website_url?: string | null
        }
        Update: {
          app_name?: string
          app_secret?: string | null
          callback_urls?: string[]
          created_at?: string
          description?: string | null
          id?: string
          monthly_request_limit?: number | null
          oauth_settings?: Json | null
          status?: Database["public"]["Enums"]["app_status"] | null
          updated_at?: string | null
          user_id?: string
          verification_details?: Json | null
          verification_status?:
            | Database["public"]["Enums"]["app_verification_status"]
            | null
          website_url?: string | null
        }
        Relationships: []
      }
      developer_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_subtasks: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["todo_status"]
          title: string
          todo_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["todo_status"]
          title: string
          todo_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["todo_status"]
          title?: string
          todo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_subtasks_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "developer_todos"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_todos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["todo_priority"]
          status: Database["public"]["Enums"]["todo_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["todo_priority"]
          status?: Database["public"]["Enums"]["todo_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["todo_priority"]
          status?: Database["public"]["Enums"]["todo_status"]
          title?: string
          updated_at?: string
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
      notification_preferences: {
        Row: {
          address_access_notifications: boolean
          created_at: string
          email_notifications: boolean
          id: string
          marketing_notifications: boolean
          updated_at: string
          user_id: string
          verification_notifications: boolean
          webhook_notifications: boolean
        }
        Insert: {
          address_access_notifications?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_notifications?: boolean
          updated_at?: string
          user_id: string
          verification_notifications?: boolean
          webhook_notifications?: boolean
        }
        Update: {
          address_access_notifications?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_notifications?: boolean
          updated_at?: string
          user_id?: string
          verification_notifications?: boolean
          webhook_notifications?: boolean
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
          postal_verification_date: string | null
          postal_verified: boolean | null
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
          postal_verification_date?: string | null
          postal_verified?: boolean | null
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
          postal_verification_date?: string | null
          postal_verified?: boolean | null
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
      postal_verification_codes: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          mail_status: string
          max_attempts: number
          physical_address_id: string
          status: string
          tracking_number: string | null
          user_id: string
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          mail_status?: string
          max_attempts?: number
          physical_address_id: string
          status?: string
          tracking_number?: string | null
          user_id: string
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          mail_status?: string
          max_attempts?: number
          physical_address_id?: string
          status?: string
          tracking_number?: string | null
          user_id?: string
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postal_verification_codes_physical_address_id_fkey"
            columns: ["physical_address_id"]
            isOneToOne: false
            referencedRelation: "physical_addresses"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_logs: {
        Row: {
          attempt_count: number
          created_at: string
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          status: string
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          status: string
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          status?: string
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_retry_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          log_id: string
          max_attempts: number
          scheduled_at: string
          status: string
          updated_at: string
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          log_id: string
          max_attempts?: number
          scheduled_at?: string
          status?: string
          updated_at?: string
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          log_id?: string
          max_attempts?: number
          scheduled_at?: string
          status?: string
          updated_at?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_retry_queue_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "webhook_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_retry_queue_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          app_id: string
          created_at: string
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          secret_key: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          events: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret_key: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret_key?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "developer_apps"
            referencedColumns: ["id"]
          },
        ]
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
      cleanup_old_webhook_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_status: "active" | "suspended" | "development"
      app_verification_status: "pending" | "verified" | "rejected"
      todo_priority: "high" | "medium" | "low"
      todo_status: "completed" | "in-progress" | "not-started" | "blocked"
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
      app_status: ["active", "suspended", "development"],
      app_verification_status: ["pending", "verified", "rejected"],
      todo_priority: ["high", "medium", "low"],
      todo_status: ["completed", "in-progress", "not-started", "blocked"],
    },
  },
} as const
