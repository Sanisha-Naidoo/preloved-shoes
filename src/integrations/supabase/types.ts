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
      feedback_reports: {
        Row: {
          actual_behavior: string | null
          created_at: string
          description: string
          expected_behavior: string | null
          feedback_type: string
          id: string
          page_url: string | null
          priority: string
          reproduction_steps: string | null
          screenshot_url: string | null
          status: string
          title: string
          updated_at: string
          user_agent: string | null
          user_email: string
        }
        Insert: {
          actual_behavior?: string | null
          created_at?: string
          description: string
          expected_behavior?: string | null
          feedback_type: string
          id?: string
          page_url?: string | null
          priority?: string
          reproduction_steps?: string | null
          screenshot_url?: string | null
          status?: string
          title: string
          updated_at?: string
          user_agent?: string | null
          user_email: string
        }
        Update: {
          actual_behavior?: string | null
          created_at?: string
          description?: string
          expected_behavior?: string | null
          feedback_type?: string
          id?: string
          page_url?: string | null
          priority?: string
          reproduction_steps?: string | null
          screenshot_url?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_agent?: string | null
          user_email?: string
        }
        Relationships: []
      }
      galleries: {
        Row: {
          allow_guest_uploads: boolean
          created_at: string
          description: string | null
          home_id: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          allow_guest_uploads?: boolean
          created_at?: string
          description?: string | null
          home_id: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          allow_guest_uploads?: boolean
          created_at?: string
          description?: string | null
          home_id?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "trustee_homes"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_link_requests: {
        Row: {
          email: string
          id: string
          ip_address: unknown | null
          requested_at: string | null
        }
        Insert: {
          email: string
          id?: string
          ip_address?: unknown | null
          requested_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          ip_address?: unknown | null
          requested_at?: string | null
        }
        Relationships: []
      }
      notion_locks: {
        Row: {
          locked_at: string
          shoe_id: string
          user_id: string | null
        }
        Insert: {
          locked_at?: string
          shoe_id: string
          user_id?: string | null
        }
        Update: {
          locked_at?: string
          shoe_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      scan_entries: {
        Row: {
          created_at: string
          description: string | null
          file_size: number
          file_type: string
          file_url: string
          filename: string
          id: string
          notes: string | null
          notion_id: string | null
          shoe_id: string | null
          tags: string[] | null
          upload_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size: number
          file_type: string
          file_url: string
          filename: string
          id?: string
          notes?: string | null
          notion_id?: string | null
          shoe_id?: string | null
          tags?: string[] | null
          upload_date?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          notes?: string | null
          notion_id?: string | null
          shoe_id?: string | null
          tags?: string[] | null
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_entries_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
      shoes: {
        Row: {
          brand: string
          condition: string
          created_at: string
          id: string
          model: string | null
          photo_url: string | null
          qr_code: string | null
          rating: number | null
          size: string
          size_unit: string
          sole_photo_url: string | null
          user_id: string | null
        }
        Insert: {
          brand: string
          condition: string
          created_at?: string
          id?: string
          model?: string | null
          photo_url?: string | null
          qr_code?: string | null
          rating?: number | null
          size: string
          size_unit?: string
          sole_photo_url?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string
          condition?: string
          created_at?: string
          id?: string
          model?: string | null
          photo_url?: string | null
          qr_code?: string | null
          rating?: number | null
          size?: string
          size_unit?: string
          sole_photo_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shoutbox_messages: {
        Row: {
          id: string
          message: string
          name: string
          timestamp: string
        }
        Insert: {
          id?: string
          message: string
          name: string
          timestamp?: string
        }
        Update: {
          id?: string
          message?: string
          name?: string
          timestamp?: string
        }
        Relationships: []
      }
      trustee_actions: {
        Row: {
          action_type: string
          approved_by: string[] | null
          created_at: string | null
          file_id: string | null
          gallery_id: string | null
          id: string
          proposed_by: string
          rejected_by: string[] | null
          status: string
          target_gallery_id: string | null
        }
        Insert: {
          action_type: string
          approved_by?: string[] | null
          created_at?: string | null
          file_id?: string | null
          gallery_id?: string | null
          id?: string
          proposed_by: string
          rejected_by?: string[] | null
          status?: string
          target_gallery_id?: string | null
        }
        Update: {
          action_type?: string
          approved_by?: string[] | null
          created_at?: string | null
          file_id?: string | null
          gallery_id?: string | null
          id?: string
          proposed_by?: string
          rejected_by?: string[] | null
          status?: string
          target_gallery_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trustee_actions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "trustee_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trustee_actions_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "trustee_homes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trustee_actions_target_gallery_id_fkey"
            columns: ["target_gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      trustee_files: {
        Row: {
          caption: string | null
          encrypted_iv: string
          file_name: string
          file_size: number
          file_type: string
          gallery_id: string | null
          home_id: string
          id: string
          ipfs_cid: string
          status: string
          uploaded_at: string
          uploader_email: string
        }
        Insert: {
          caption?: string | null
          encrypted_iv: string
          file_name: string
          file_size: number
          file_type: string
          gallery_id?: string | null
          home_id: string
          id?: string
          ipfs_cid: string
          status?: string
          uploaded_at?: string
          uploader_email: string
        }
        Update: {
          caption?: string | null
          encrypted_iv?: string
          file_name?: string
          file_size?: number
          file_type?: string
          gallery_id?: string | null
          home_id?: string
          id?: string
          ipfs_cid?: string
          status?: string
          uploaded_at?: string
          uploader_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "trustee_files_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      trustee_homes: {
        Row: {
          created_at: string | null
          id: string
          shared_key: string
          slug: string
          trustee_1_email: string
          trustee_2_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shared_key: string
          slug: string
          trustee_1_email: string
          trustee_2_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shared_key?: string
          slug?: string
          trustee_1_email?: string
          trustee_2_email?: string
        }
        Relationships: []
      }
      trustee_sessions: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          home_id: string | null
          id: string
          is_active: boolean
          last_activity: string
          session_token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          home_id?: string | null
          id?: string
          is_active?: boolean
          last_activity?: string
          session_token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          home_id?: string | null
          id?: string
          is_active?: boolean
          last_activity?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "trustee_sessions_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "trustee_homes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_trustee_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_magic_link_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      copy_file_to_gallery: {
        Args: {
          file_id_param: string
          target_gallery_id_param: string
          user_email_param: string
        }
        Returns: string
      }
      exec_sql: {
        Args: { sql_query: string; sql_params?: string[] }
        Returns: Json
      }
      extend_trustee_session: {
        Args: { session_token_param: string }
        Returns: boolean
      }
      get_galleries_for_home: {
        Args: { home_id_param: string }
        Returns: {
          id: string
          name: string
          description: string
          is_default: boolean
        }[]
      }
      get_public_gallery_data: {
        Args: { gallery_slug: string; gallery_id_param?: string }
        Returns: {
          home_slug: string
          shared_key: string
          gallery_id: string
          gallery_name: string
          gallery_description: string
          trustee_1_email: string
          trustee_2_email: string
          last_updated: string
        }[]
      }
      move_file_to_gallery: {
        Args: {
          file_id_param: string
          target_gallery_id_param: string
          user_email_param: string
        }
        Returns: boolean
      }
      validate_email: {
        Args: { email_input: string }
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
