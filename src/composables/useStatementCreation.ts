import { ref, computed } from 'vue';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Statement } from '../types/models';
import { useSupabase } from './useSupabase';

export const ERROR_MESSAGES = {
  '23505': 'This statement already exists.',
  '23514': 'Statement is not properly formatted.',
  '42501': 'You need to be logged in to create a statement.',
  P0001: 'Statements require at least two words.',
  default: 'There was an error creating your statement. Please try again.',
} as const;

export function useStatementCreation() {
  const supabase = useSupabase();
  const errorMessage = ref<PostgrestError | null>(null);

  const friendlyErrorMessage = computed(() => {
    if (!errorMessage.value) return '';

    const code = errorMessage.value.code;
    return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
  });

  const sanitizeQuery = (query: string): string => {
    const sanitized = query.replace(/[^a-zA-Z0-9\s,\-'"()!$#%]/g, '').trim();
    if (sanitized.length === 0) {
      return '';
    }
    const capitalized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);

    const endsWithValidPunctuation = /[.!]$/.test(capitalized);
    const cleaned = capitalized.replace(/\?$/, '');
    return endsWithValidPunctuation ? cleaned : cleaned + '.';
  };

  const createNewStatement = async (query: string): Promise<Statement | null> => {
    try {
      const sanitizedQuery = sanitizeQuery(query);
      console.log('Creating new statement:', sanitizedQuery);
      const new_statement = await supabase.createNewStatement(sanitizedQuery);
      console.log('New statement created:', new_statement);
      errorMessage.value = null;
      return new_statement as Statement;
    } catch (error) {
      console.error('Create new statement error:', error);
      errorMessage.value = error as PostgrestError;
      return null;
    }
  };

  return {
    errorMessage,
    friendlyErrorMessage,
    sanitizeQuery,
    createNewStatement,
  };
}
