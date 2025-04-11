import type { PostgrestError } from '@supabase/supabase-js';
import type { Argument, StatementType } from 'src/types/models';
import { supabase } from 'src/utils/supabase';
import { ref, computed } from 'vue';

//Not really using these right now.
const ERROR_MESSAGES = {
  P0001: 'Title cannot be empty.',
  '23505': {
    arguments_title_key: 'An argument with this title already exists.',
    arguments_statement_array_key:
      'This exact combination of statements has already been used in an argument.',
    default: 'This argument already exists.',
  },
  default: 'There was an error creating your argument. Please try again.',
} as const;

export function useArgumentCreation() {
  const errorMessage = ref<PostgrestError | null>(null);

  const friendlyErrorMessage = computed(() => {
    if (!errorMessage.value) return '';

    const code = errorMessage.value.code;

    // Handle unique constraint violations
    if (code === '23505') {
      const message = errorMessage.value.message;
      if (message.includes('arguments_title_key')) {
        return ERROR_MESSAGES['23505']['arguments_title_key'];
      }
      if (message.includes('arguments_statement_array_key')) {
        return ERROR_MESSAGES['23505']['arguments_statement_array_key'];
      }
      return ERROR_MESSAGES['23505'].default;
    }

    // Handle other errors
    return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
  });

  /**
   * Creates a new argument in the database
   */
  const createNewArgument = async (
    title: string,
    conclusion_id: number,
    statement_array: number[],
    argument_type: StatementType,
  ): Promise<Argument> => {
    try {
      const { data, error } = await supabase
        .from('arguments')
        .insert([{ title, conclusion_id, statement_array, argument_type }])
        .select('*, profiles(username)')
        .single();

      if (error) throw error;
      const newArgument = {
        ...data,
        username: data.profiles.username,
      } as Argument;
      console.log('Created new argument:', newArgument);
      return newArgument;
    } catch (error) {
      errorMessage.value = error as PostgrestError;
      throw error;
    }
  };

  return { createNewArgument, errorMessage, friendlyErrorMessage };
}
