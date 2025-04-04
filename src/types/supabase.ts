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
      argument_statements: {
        Row: {
          argument_id: number
          id: number
          statement_id: number
          statement_position: number
        }
        Insert: {
          argument_id: number
          id?: number
          statement_id: number
          statement_position?: number
        }
        Update: {
          argument_id?: number
          id?: number
          statement_id?: number
          statement_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "argument_statements_argument_id_fkey"
            columns: ["argument_id"]
            isOneToOne: false
            referencedRelation: "argument_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argument_statements_argument_id_fkey"
            columns: ["argument_id"]
            isOneToOne: false
            referencedRelation: "arguments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argument_statements_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argument_statements_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "statements_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      argument_votes: {
        Row: {
          argument_id: number
          created_at: string
          id: number
          user_id: string
          vote_value: boolean
        }
        Insert: {
          argument_id: number
          created_at?: string
          id?: number
          user_id: string
          vote_value?: boolean
        }
        Update: {
          argument_id?: number
          created_at?: string
          id?: number
          user_id?: string
          vote_value?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "argument_votes_argument_id_fkey"
            columns: ["argument_id"]
            isOneToOne: false
            referencedRelation: "argument_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argument_votes_argument_id_fkey"
            columns: ["argument_id"]
            isOneToOne: false
            referencedRelation: "arguments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argument_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arguments: {
        Row: {
          argument_type: Database["public"]["Enums"]["statementtypes"]
          comments_count: number
          conclusion_id: number
          created_at: string
          downvotes: number
          id: number
          score: number
          statement_array: number[]
          title: string
          upvotes: number
          user_id: string
        }
        Insert: {
          argument_type?: Database["public"]["Enums"]["statementtypes"]
          comments_count?: number
          conclusion_id: number
          created_at?: string
          downvotes?: number
          id?: number
          score?: number
          statement_array?: number[]
          title: string
          upvotes?: number
          user_id?: string
        }
        Update: {
          argument_type?: Database["public"]["Enums"]["statementtypes"]
          comments_count?: number
          conclusion_id?: number
          created_at?: string
          downvotes?: number
          id?: number
          score?: number
          statement_array?: number[]
          title?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arguments_conclusion_id_fkey"
            columns: ["conclusion_id"]
            isOneToOne: false
            referencedRelation: "statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arguments_conclusion_id_fkey"
            columns: ["conclusion_id"]
            isOneToOne: false
            referencedRelation: "statements_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arguments_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comments: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: number
          parent_id: number
          parent_type: Database["public"]["Enums"]["parent_type"]
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: never
          parent_id: number
          parent_type?: Database["public"]["Enums"]["parent_type"]
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: never
          parent_id?: number
          parent_type?: Database["public"]["Enums"]["parent_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      statement_relationships: {
        Row: {
          created_at: string
          from_statement_id: number
          id: number
          score: number
          statement_type: Database["public"]["Enums"]["statementtypes"]
          to_statement_id: number
        }
        Insert: {
          created_at?: string
          from_statement_id: number
          id?: number
          score?: number
          statement_type: Database["public"]["Enums"]["statementtypes"]
          to_statement_id: number
        }
        Update: {
          created_at?: string
          from_statement_id?: number
          id?: number
          score?: number
          statement_type?: Database["public"]["Enums"]["statementtypes"]
          to_statement_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "topic_relationships_child_topic_id_fkey"
            columns: ["to_statement_id"]
            isOneToOne: false
            referencedRelation: "statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_relationships_child_topic_id_fkey"
            columns: ["to_statement_id"]
            isOneToOne: false
            referencedRelation: "statements_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_relationships_parent_topic_id_fkey"
            columns: ["from_statement_id"]
            isOneToOne: false
            referencedRelation: "statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_relationships_parent_topic_id_fkey"
            columns: ["from_statement_id"]
            isOneToOne: false
            referencedRelation: "statements_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      statements: {
        Row: {
          comments_count: number
          created_at: string
          id: number
          opposing_arguments_count: number
          statement_text: string
          supporting_arguments_count: number
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          id?: never
          opposing_arguments_count?: number
          statement_text: string
          supporting_arguments_count?: number
          user_id?: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          id?: never
          opposing_arguments_count?: number
          statement_text?: string
          supporting_arguments_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "statements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trigger_logs: {
        Row: {
          action: string | null
          created_at: string | null
          id: number
          trigger_name: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: never
          trigger_name?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: never
          trigger_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      argument_view: {
        Row: {
          argument_type: Database["public"]["Enums"]["statementtypes"] | null
          comments_count: number | null
          conclusion_id: number | null
          created_at: string | null
          downvotes: number | null
          has_voted: boolean | null
          id: number | null
          score: number | null
          statement_array: number[] | null
          title: string | null
          upvotes: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arguments_conclusion_id_fkey"
            columns: ["conclusion_id"]
            isOneToOne: false
            referencedRelation: "statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arguments_conclusion_id_fkey"
            columns: ["conclusion_id"]
            isOneToOne: false
            referencedRelation: "statements_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arguments_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      statements_with_profiles: {
        Row: {
          comments_count: number | null
          created_at: string | null
          id: number | null
          opposing_arguments_count: number | null
          statement_text: string | null
          supporting_arguments_count: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      check_similar_statements: {
        Args: {
          search_text: string
          min_similarity?: number
          result_limit?: number
        }
        Returns: Json
      }
      delete_relationship_vote: {
        Args: {
          p_relationship_id: number
        }
        Returns: undefined
      }
      dmetaphone: {
        Args: {
          "": string
        }
        Returns: string
      }
      dmetaphone_alt: {
        Args: {
          "": string
        }
        Returns: string
      }
      get_argument: {
        Args: {
          p_argument_id: number
        }
        Returns: {
          id: number
          created_at: string
          user_id: string
          title: string
          conclusion_id: number
          argument_type: Database["public"]["Enums"]["statementtypes"]
          username: string
          upvotes: number
          downvotes: number
          comments_count: number
          score: number
          users_vote: boolean
        }[]
      }
      get_statement: {
        Args: {
          statement_id: number
        }
        Returns: Json
      }
      get_statements_by_argument: {
        Args: {
          argument_id: number
        }
        Returns: {
          id: number
          statement_text: string
          statement_position: number
          user_id: string
          created_at: string
          username: string
        }[]
      }
      get_statements_by_relationship: {
        Args: {
          p_id: number
          p_statement_type: Database["public"]["Enums"]["statementtypes"]
          p_offset?: number
          p_limit?: number
        }
        Returns: Json
      }
      get_statements_with_positions: {
        Args: {
          p_argument_id: number
        }
        Returns: {
          statement_id: number
          statement_text: string
          statement_position: number
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      insert_statement_relationship: {
        Args: {
          p_from_statement_id: number
          p_to_statement_id: number
          p_statement_type: Database["public"]["Enums"]["statementtypes"]
        }
        Returns: number
      }
      reconcile_statement_comments_count: {
        Args: {
          statement_id: number
        }
        Returns: undefined
      }
      reconcile_statement_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recursive_comment_counts: {
        Args: {
          comment_id: number
        }
        Returns: number
      }
      search_statements: {
        Args: {
          search_term: string
          offset_value?: number
          limit_value?: number
        }
        Returns: {
          data: Json
          meta: Json
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      soundex: {
        Args: {
          "": string
        }
        Returns: string
      }
      text_soundex: {
        Args: {
          "": string
        }
        Returns: string
      }
      toggle_argument_vote_DEPRECATED: {
        Args: {
          p_argument_id: number
          p_vote_value: boolean
        }
        Returns: boolean
      }
      update_wilson_score: {
        Args: {
          p_argument_id: number
        }
        Returns: undefined
      }
      validate_and_sanitize_statement: {
        Args: {
          input_text: string
        }
        Returns: string
      }
      wilson_lower_bound: {
        Args: {
          upvotes: number
          downvotes: number
          z?: number
        }
        Returns: number
      }
    }
    Enums: {
      parent_type: "statement" | "argument" | "comment"
      statementtypes: "OPPOSES" | "SUPPORTS"
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
