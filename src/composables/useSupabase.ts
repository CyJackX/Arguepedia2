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
import { supabase } from '@/components/supabase';
import type {
  Statement,
  SearchResult,
  RelatedStatement,
  StatementType,
  Argument,
} from '@/types/types';

export function useSupabase() {
  const user = ref(null); // Add user state
  const statementError = ref(null);

  /**
   * Authentication Operations
   * Handle user session management and auth state changes
   */
  const getUser = async () => {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      user.value = null;
    } else {
      user.value = currentUser;
    }
    return user.value;
  };

  // Initialize user state
  getUser();

  const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null;
      callback?.(event, session);
    });
  };

  /**
   * Searches for statements similar to the provided text using fuzzy matching
   */
  const checkSimilarStatements = async (
    text: string,
    minSimilarity = 0.3,
    limit = 5,
  ): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase.rpc('check_similar_statements', {
        search_text: text.trim(),
        min_similarity: minSimilarity,
        result_limit: limit,
      });

      if (error) {
        console.error('Error in checkSimilarStatements:', error);
        return [];
      }
      console.log('checkSimilarStatements data:', data);
      return data || [];
    } catch (err) {
      console.error('Exception in checkSimilarStatements:', err);
      return [];
    }
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
   * Statement Fetching Operations
   */
  const getRandomStatementId = async () => {
    console.log('Getting random statement ID');
    try {
      const { count, error: countError } = await supabase
        .from('statement')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting statement count:', countError);
        return null;
      }

      const randomIndex = Math.floor(Math.random() * count);
      const { data, error } = await supabase
        .from('statement')
        .select('id')
        .range(randomIndex, randomIndex)
        .single();

      if (error) {
        console.error('Error getting random statement:', error);
        return null;
      }

      return data.id;
    } catch (err) {
      console.error('Unexpected error in getRandomStatementId:', err);
      return null;
    }
  };

  /**
   * Fetches a statement from the database by ID or gets a random statement if no ID provided
   */
  const fetchStatement = async (id: number): Promise<Statement | null> => {
    try {
      const { data, error } = await supabase.from('statement').select('*').eq('id', id).single();

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
    offset: number,
    limit: number,
  ): Promise<Argument[] | null> => {
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
      return data;
    } catch (err) {
      console.error('Arguments fetch error:', err);
      throw err;
    }
  };

  /**
   * Fetches statements connected to a given statement ID with a specific relationship type
   */
  const fetchConnectedStatements = async (
    statementId: number,
    statementType: StatementType,
    offset = 0,
    limit = 10,
  ): Promise<RelatedStatement[]> => {
    console.log(
      `Fetching ${limit} "${statementType.toLowerCase()}" statements for statement ID ${statementId}, starting at offset ${offset}`,
    );
    try {
      // Call the stored procedure to get connected statements ordered by score
      const { data, error } = await supabase.rpc('get_statements_by_relationship', {
        p_id: statementId,
        p_statement_type: statementType,
        p_offset: offset,
        p_limit: limit,
      });

      if (error) {
        console.error('Error fetching connected statements:', error);
        return [];
      }
      console.log(
        `Found ${data?.length || 0} connected statements of type ${statementType} for statement ID ${statementId}:`,
        data,
      );
      return data || [];
    } catch (err) {
      console.error('Unexpected error in fetchConnectedStatements:', err);
      return [];
    }
  };

  /**
   * Creates a connection between two statements with a specified relationship type
   */
  const createConnection = async (
    fromStatementId: number,
    toStatementId: number,
    relationshipType: StatementType,
  ): Promise<{ data?: number; error?: Error }> => {
    try {
      const { data: newRelationshipID, error } = await supabase.rpc(
        'insert_statement_relationship',
        {
          p_from_statement_id: fromStatementId,
          p_to_statement_id: toStatementId,
          p_statement_type: relationshipType,
        },
      );

      if (error) throw error;
      console.log('Connection created:', newRelationshipID);
      return { data: newRelationshipID };
    } catch (error) {
      console.error('Error submitting connection:', error);
      return { error };
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
        `User ${user.value?.id}'s vote on relationship #${relationshipId} has been updated to:`,
        data,
      );

      // Returns true for upvote, false for downvote, or null for deleted vote from RPC.
      return data;
    } catch (error) {
      console.error('Error updating vote:', error);
      return null;
    }
  };

  return {
    getUser,
    onAuthStateChange,
    checkSimilarStatements,
    createNewStatement,
    fetchStatement,
    fetchArguments_by_conclusion,
    user, // Export the user ref
    statementError,
    fetchConnectedStatements,
    createConnection,
    updateVote,
  };
}
