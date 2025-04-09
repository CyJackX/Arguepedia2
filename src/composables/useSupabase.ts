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
import type { Statement, StatementType, Argument, Profile, Comment } from '../types/models';
import type { Database } from '../types/supabase';
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
    sort_method: string,
  ): Promise<[Statement[], number]> => {
    console.log('Searching for statements:', search_term);
    const { data, error } = await supabase.rpc('search_statements', {
      search_term,
      offset_value,
      limit_value,
      sort_method,
    });
    if (error) {
      console.error('Error in searchStatements:', error);
      return [[], 0];
    }

    const { data: statements, meta } = data[0];
    return [statements as Statement[], meta.total_count];
  };

  /**
   * Creates a new statement in the database
   */
  const createNewStatement = async (
    text: string,
  ): Promise<Database['public']['Tables']['statements']['Row']> => {
    const { data, error } = await supabase
      .from('statements')
      .insert([{ statement_text: text }])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  };

  /**
   * Fetches a statement from the database by ID
   */
  const fetchStatement = async (statement_id: number): Promise<Statement> => {
    try {
      const { data, error } = await supabase
        .from('statements_with_profiles')
        .select('*')
        .eq('id', statement_id)
        .single();
      if (error) throw error;
      return data as Statement;
    } catch (err) {
      console.error('Statement fetch error:', err);
      throw err;
    }
  };

  const fetchArgumentbyId = async (argument_id: number): Promise<Argument> => {
    try {
      console.log('Fetching argument by ID:', argument_id);
      const { data, error } = await supabase
        .from('argument_view')
        .select('*')
        .eq('id', argument_id)
        .single();
      if (error) throw error;
      console.log('Fetched argument:', data);
      return data as Argument;
    } catch (err) {
      console.error('Argument fetch error:', err);
      throw err;
    }
  };
  /**
   * Fetches arguments for a conclusion from the database
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
        .from('argument_view')
        .select('*')
        .eq('conclusion_id', conclusion_id)
        .eq('argument_type', argument_type)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching arguments:', error);
        throw error;
      }

      console.log(`Successfully fetched arguments:`, data);
      return data as Argument[];
    } catch (err) {
      console.error('Arguments fetch error:', err);
      throw err;
    }
  };

  /**
   * Fetches statements connected to a given argument ID
   */
  const fetchConnectedStatements = async (statement_array: number[]): Promise<Statement[]> => {
    console.log('Fetching connected statements for argument ID:', statement_array);
    try {
      const { data, error } = await supabase
        .from('statements_with_profiles')
        .select('*')
        .in('id', statement_array);

      if (error) {
        console.error('Error fetching connected statements:', error);
        throw error;
      }
      console.log('Successfully fetched connected statements:', data);
      return data as Statement[];
    } catch (err) {
      console.error('Error fetching connected statements:', err);
      throw err;
    }
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
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data as Profile;
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
    fetchArgumentbyId,
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
    createNewArgument,
  };
}
