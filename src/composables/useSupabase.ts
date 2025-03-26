/**
 * Supabase Integration Composable
 * Provides centralized database access and state management
 *
 * Key Responsibilities:
 * - Authentication state management
 * - Statement CRUD operations
 * - Search and similarity checking
 * - Cache management for statements
 */

import { ref } from 'vue';
import { supabase } from '../utils/supabase';
import type {
  Statement,
  RelatedStatement,
  StatementType,
  Argument,
  TopicType,
  Comment,
  Profile,
} from '../components/models';
import { useAuthStore } from '../stores/authStore';

export function useSupabase() {
  const authStore = useAuthStore();
  const userProfile = ref<Profile | null>(null);

  /**
   * Searches for statements similar to the provided text using fuzzy matching
   */
  const searchStatements = async (
    search_term: string,
    offset_value: number,
    limit_value: number,
  ): Promise<Statement[]> => {
    console.log('Searching for statements:', search_term);
    const { data, error } = await supabase.rpc('search_statements', {
      search_term,
      offset_value,
      limit_value,
    });
    if (error) {
      console.error('Error in searchStatements:', error);
      return [];
    }
    return data || [];
  };

  /**
   * Creates a new statement in the database
   */
  const createNewStatement = async (text: string): Promise<{ id: number } | { error: string }> => {
    try {
      const { data, error } = await supabase
        .from('statement')
        .insert([{ statement_text: text }])
        .select('id')
        .single();

      if (error) {
        return { error: error.message };
      }
      return { id: data.id };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  /**
   * Fetches a statement from the database by ID or gets a random statement if no ID provided
   */
  const fetchStatement = async (statement_id: number): Promise<Statement | null> => {
    try {
      const { data, error } = await supabase.rpc('get_statement', { statement_id });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Statement fetch error:', err);
      throw err;
    }
  };

  /**
   * Fetches an argument from the database by ID using the get_argument stored procedure
   * @param id The ID of the argument to fetch
   */
  const fetchArguments_by_conclusion = async (
    conclusion_id: number,
    argument_type: StatementType,
    offset: number = 0,
    limit: number = 10,
  ): Promise<Argument[]> => {
    console.log(
      `Fetching arguments for conclusion ID ${conclusion_id} and statement type ${argument_type}`,
    );
    try {
      const { data, error } = await supabase
        .from('arguments')
        .select(
          `
          *,
          profiles (
            username
          ),
          argument_votes (
            vote_value
          )
        `,
        )
        .eq('conclusion_id', conclusion_id)
        .eq('argument_type', argument_type)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching arguments:', error);
        throw error;
      }

      console.log(`Successfully fetched arguments:`, data);
      const args = data.map((argument) => ({
        ...argument,
        username: argument.profiles.username,
        vote_value: argument.argument_votes.vote_value,
      }));
      return args;
    } catch (err) {
      console.error('Arguments fetch error:', err);
      throw err;
    }
  };

  /**
   * Fetches statements connected to a given statement ID with a specific relationship type
   */
  const fetchConnectedStatements = async (p_argument_id: number): Promise<RelatedStatement[]> => {
    console.log(`Fetching connected statements for argument ID ${p_argument_id}`);
    const { data, error } = await supabase.rpc('get_statements_with_positions', {
      p_argument_id: p_argument_id,
    });
    if (error) {
      console.error('Error fetching connected statements:', error);
      return [];
    }
    return data || [];
  };

  /**
   * Updates or creates a vote for a statement relationship
   * @param relationshipId - The ID of the statement relationship to vote on
   * @param vote - True for upvote, false for downvote
   * @returns True for upvote, false for downvote, or null for deleted vote from RPC.
   */
  const updateVote = async (relationshipId: number, vote: boolean): Promise<boolean | null> => {
    try {
      const { data, error } = await supabase.rpc('toggle_relationship_vote', {
        p_relationship_id: relationshipId,
        p_vote_value: vote,
      });

      if (error) throw error;
      console.log(
        `User ${authStore.user?.id}'s vote on relationship #${relationshipId} has been updated to:`,
        data,
      );

      // Returns true for upvote, false for downvote, or null for deleted vote from RPC.
      return data;
    } catch (error) {
      console.error('Error updating vote:', error);
      return null;
    }
  };

  const fetchComments = async (parent_id: number, parent_type: TopicType): Promise<Comment[]> => {
    try {
      console.log('Fetching comments for parent ID:', parent_id, 'parent type:', parent_type);
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles (username)')
        .eq('parent_id', parent_id)
        .eq('parent_type', parent_type);

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      const comments = data.map((comment) => ({
        ...comment,
        username: comment.profiles.username,
      }));
      return comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const createComment = async (
    parent_id: number,
    parent_type: TopicType,
    content: string,
  ): Promise<Comment | null> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: authStore.user?.id,
          parent_id,
          parent_type,
          content,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  };

  return {
    searchStatements,
    createNewStatement,
    fetchStatement,
    fetchArguments_by_conclusion,
    fetchConnectedStatements,
    updateVote,
    fetchComments,
    createComment,
    auth: authStore,
    userProfile,
  };
}
