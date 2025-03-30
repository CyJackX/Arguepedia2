/**
 * Supabase Integration Composable
 * Provides centralized database access and state management
 *
 * Key Responsibilities:
 * - Authentication state management
 * - Statement CRUD operations
 * - Search and similarity checking
 * - Cache management for statements
 * - Profile and user activity queries
 */

import { ref } from 'vue';
import { supabase } from '../utils/supabase';
import type {
  Statement,
  RelatedStatement,
  StatementType,
  Argument,
  Profile,
  Comment,
} from '../components/models';
import { useAuthStore } from '../stores/authStore';

export function useSupabase() {
  const authStore = useAuthStore();
  const userProfile = ref<Profile | null>(null);
  const userStatements = ref<Statement[]>([]);
  const userArguments = ref<Argument[]>([]);
  const userComments = ref<Comment[]>([]);

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
  const fetchConnectedStatements = async (argument_id: number): Promise<RelatedStatement[]> => {
    const { data, error } = await supabase
      .from('argument_statements')
      .select('statements_with_profiles(*), statement_position')
      .eq('argument_id', argument_id)
      .order('statement_position', { ascending: true });

    if (error) {
      console.error('Error fetching statements:', error);
      throw error;
    }
    const statements =
      data?.map((item) => item.statements_with_profiles as unknown as RelatedStatement) || [];
    console.log('Related statements:', statements);
    return statements;
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

  /**
   * Fetches a user's profile by username
   */
  const fetchUserProfile = async (username: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  };

  /**
   * Fetches all user activity (statements, arguments, comments) in parallel
   */
  const fetchUserActivity = async (userId: string) => {
    console.log('Fetching activity for user:', userId);

    const [statementsResponse, argumentsResponse, commentsResponse] = await Promise.all([
      supabase
        .from('statements')
        .select('*, profiles(username)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('arguments')
        .select('*, profiles(username)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('comments')
        .select('*, profiles(username)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (statementsResponse.error) {
      console.error('Error fetching statements:', statementsResponse.error);
    }
    if (argumentsResponse.error) {
      console.error('Error fetching arguments:', argumentsResponse.error);
    }
    if (commentsResponse.error) {
      console.error('Error fetching comments:', commentsResponse.error);
    }

    userStatements.value =
      statementsResponse.data?.map((statement) => ({
        ...statement,
        username: statement.profiles.username,
      })) || [];
    userArguments.value =
      argumentsResponse.data?.map((argument) => ({
        ...argument,
        username: argument.profiles.username,
      })) || [];
    userComments.value =
      commentsResponse.data?.map((comment) => ({
        ...comment,
        username: comment.profiles.username,
      })) || [];

    console.log('Fetched statements:', userStatements.value.length);
    console.log('Fetched arguments:', userArguments.value.length);
    console.log('Fetched comments:', userComments.value.length);
  };

  return {
    searchStatements,
    createNewStatement,
    fetchStatement,
    fetchArguments_by_conclusion,
    fetchConnectedStatements,
    updateVote,
    fetchUserProfile,
    fetchUserActivity,
    auth: authStore,
    userProfile,
    userStatements,
    userArguments,
    userComments,
  };
}
