<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { PostgrestError } from '@supabase/supabase-js';

const { searchTerm } = inject('search') as {
  searchTerm: Ref<string>,
  searchTrigger: Ref<number>
};

const router = useRouter();
const supabase = useSupabase();
const errorMessage = ref<PostgrestError | null>(null);

const ERROR_MESSAGES = {
  '23505': 'This statement already exists.',
  '23514': 'Statement is not properly formatted.',
  '42501': 'You need to be logged in to create a statement.',
  'default': 'There was an error creating your statement. Please try again.'
} as const;

const friendlyErrorMessage = computed(() => {
  if (!errorMessage.value) return '';

  const code = errorMessage.value.code;
  return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
});

const sanitizeQuery = (query: string): string => {
  // Step 1: Whitelist alphanumeric, spaces, and dialogue/argumentation symbols
  const sanitized = query
    .replace(/[^a-zA-Z0-9\s,\-'"()!$#%]/g, '') // Keep letters, numbers, spaces, ,;-:'"()!
    .trim(); // Remove leading/trailing spaces

  // Step 3: Capitalize the first letter
  const capitalized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);

  // Step 4: Ensure it ends with a period (not a question mark)
  const endsWithValidPunctuation = /[.!]$/.test(capitalized);
  const cleaned = capitalized.replace(/\?$/, ''); // Remove trailing ? if present
  return endsWithValidPunctuation ? cleaned : cleaned + '.';
};

const createNewStatement = async () => {
  try {
    const sanitizedQuery = sanitizeQuery(searchTerm.value);
    console.log('Creating new statement:', sanitizedQuery);
    const new_statement = await supabase.createNewStatement(sanitizedQuery);
    console.log('New statement created:', new_statement);
    void router.push(`/statement/${new_statement.id}`);
  } catch (error) {
    console.error('Create new statement error:', error);
    errorMessage.value = error as PostgrestError;
  }
};
</script>

<template>
  <q-item class="column items-center">
    <q-item-section>
      <h6 class="q-my-none">Create New Statement</h6>
    </q-item-section>
    <q-item-section>
      <q-card>
        <q-card-section>
          <div class="text-weight-bold">
            {{ sanitizeQuery(searchTerm) }}
          </div>
        </q-card-section>
      </q-card>
    </q-item-section>
    <q-item-section>
      <q-card-section v-if="errorMessage">
        <div class="text-negative">{{ friendlyErrorMessage }}</div>
      </q-card-section>
    </q-item-section>
    <q-item-section>
      <q-card-actions>
        <q-btn label="Create Statement" color="primary" @click="createNewStatement" />
      </q-card-actions>
    </q-item-section>
  </q-item>
</template>
