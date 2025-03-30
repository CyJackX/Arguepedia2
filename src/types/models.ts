export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

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

export interface Argument {
  id: number;
  created_at: string; // timestamp will be handled as string in TypeScript
  user_id: string; // uuid is handled as string
  title: string;
  conclusion_id: number;
  argument_type: StatementType;
  username: string;
  upvotes: number;
  downvotes: number;
  score: number;
  users_vote: boolean | null;
  comments_count: number;
}

export type StatementType = 'SUPPORTS' | 'OPPOSES';
export type TopicType = 'statement' | 'argument' | 'comment';

export interface Comment {
  id: number;
  parent_id: number;
  parent_type: TopicType;
  content: string;
  username: string;
  created_at: string;
  comments_count: number;
}

export interface Profile {
  user_id: string;
  username: string;
}
