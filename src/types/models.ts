import type { Database } from './supabase';

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

// Base types from database
type BaseArgument = Database['public']['Tables']['arguments']['Row'];
type BaseProfile = Database['public']['Tables']['profiles']['Row'];

// Extended types with frontend-specific fields
export interface Statement {
  id: number;
  statement_text: string;
  user_id: string;
  created_at: string;
  username: string;
  comments_count: number;
  supporting_arguments_count: number;
  opposing_arguments_count: number;
}

export interface SearchResult extends Statement {
  similarity: number;
}

export interface RelatedStatement extends Statement {
  position: number;
}

export interface Argument extends BaseArgument {
  username: string;
  users_vote: boolean | null;
  comments_count: number;
}

// Keep these as they're frontend-specific
export type StatementType = Database['public']['Enums']['statementtypes'];
export type TopicType = Database['public']['Enums']['parent_type'];

export interface Comment {
  id: number;
  parent_id: number;
  parent_type: TopicType;
  content: string;
  username: string;
  created_at: string;
  comments_count: number;
}

export interface Profile extends BaseProfile {
  username: string;
}
