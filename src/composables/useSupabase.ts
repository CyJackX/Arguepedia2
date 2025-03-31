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
  StatementType,
  Argument,
  Profile,
  Comment,
  RelatedStatement,
} from '../types/models';
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
  ): Promise<Database['public']['Functions']['search_statements']['Returns']> => {
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
        .from('get_argument_view')
        .select('*')
        .eq('conclusion_id', conclusion_id)
        .eq('argument_type', argument_type)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching arguments:', error);
        throw error;
      }

      console.log(`Successfully fetched arguments:`, data);
      return (data || []).map((argument) => ({
        ...argument,
        // Ensure non-null values as required by Argument type
        id: argument.id!,
        created_at: argument.created_at!,
        user_id: argument.user_id!,
        title: argument.title!,
        conclusion_id: argument.conclusion_id!,
        argument_type: argument.argument_type!,
        upvotes: argument.upvotes!,
        downvotes: argument.downvotes!,
        score: argument.score!,
        username: argument.username!,
        users_vote: argument.users_vote,
        comments_count: 0, // This should be populated from the database if available
      }));
    } catch (err) {
      console.error('Arguments fetch error:', err);
      throw err;
    }
  };

  /**
   * Fetches statements connected to a given argument ID
   */
  const fetchConnectedStatements = async (argument_id: number): Promise<RelatedStatement[]> => {
    console.log('Fetching connected statements for argument ID:', argument_id);
    try {
      type JoinResult = {
        statement_position: number;
        statements: Database['public']['Tables']['statements']['Row'];
      };

      const { data, error } = (await supabase
        .from('argument_statements')
        .select('statement_position, statements(*)')
        .eq('argument_id', argument_id)) as {
        data: JoinResult[] | null;
        error: Error | null;
      };

      if (error) {
        console.error('Error fetching statements:', error);
        throw error;
      }

      if (!data) return [];

      const connectedStatements = data.map((item) => ({
        ...item.statements,
        statement_position: item.statement_position,
      })) as RelatedStatement[];

      console.log('Successfully fetched connected statements:', connectedStatements);
      return connectedStatements;
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
