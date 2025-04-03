<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../types/models';
import StatementComponent from '../components/StatementComponent.vue'
import { useAuthStore } from '../stores/authStore';
import type { PostgrestError } from '@supabase/supabase-js';

const route = useRoute();
const supabase = useSupabase();
const isLoading = ref(true);
const statements = ref<Statement[]>([]);
const itemsPerPage = 10;
const maxResults = 50; // Set total results to return from backend, pagination client-side.
const currentPage = ref(1);
// Compute total pages based on actual results
const totalPages = computed(() => Math.ceil(statements.value.length / itemsPerPage));
const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref<PostgrestError | null>(null);

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: '-created_at', label: 'Oldest' },
  { value: 'comments_count', label: 'Most Comments' },
  { value: 'supporting_arguments_count', label: 'Most Supporting' },
  { value: 'opposing_arguments_count', label: 'Most Opposing' },
  { value: 'ratio', label: 'Supporting/Opposing Ratio' },
  { value: 'wilson', label: 'Score' }
] as const;

const sortMethod = ref<typeof SORT_OPTIONS[number]>(SORT_OPTIONS[6]);

// Wilson score interval calculation
const calculateWilsonScore = (up: number, down: number): number => {
  const n = up + down;
  if (n === 0) return 0;

  // z=2.33 for 98% confidence
  const z = 2.33;
  const phat = up / n;

  // Wilson score interval calculation
  const numerator = phat + (z * z) / (2 * n);
  const denominator = 1 + (z * z) / n;
  const radical = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);

  return (numerator - radical) / denominator;
};

const sortedStatements = computed(() => {
  return [...statements.value].sort((a: Statement, b: Statement) => {
    switch (sortMethod.value.value) {
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case '-created_at':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'comments_count':
        return b.comments_count - a.comments_count;
      case 'supporting_arguments_count':
        return b.supporting_arguments_count - a.supporting_arguments_count;
      case 'opposing_arguments_count':
        return b.opposing_arguments_count - a.opposing_arguments_count;
      case 'ratio': {
        const ratioA = a.supporting_arguments_count / (a.opposing_arguments_count || 1);
        const ratioB = b.supporting_arguments_count / (b.opposing_arguments_count || 1);
        return ratioB - ratioA;
      }
      case 'wilson': {
        const scoreA = calculateWilsonScore(a.supporting_arguments_count, a.opposing_arguments_count);
        const scoreB = calculateWilsonScore(b.supporting_arguments_count, b.opposing_arguments_count);
        return scoreB - scoreA;
      }
      default:
        return 0;
    }
  });
});

// Compute current page of statements
const paginatedStatements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedStatements.value.slice(start, end);
});

const searchStatements = async (query: string) => {
  if (!query) return;
  // Load 100 results at once
  isLoading.value = true;
  const results = await supabase.searchStatements(query, 0, maxResults);
  statements.value = results;
  currentPage.value = 1; // Reset to first page on new search
  isLoading.value = false;
};

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
    console.log('Creating new statement:', sanitizeQuery(route.query.q as string));
    const new_statement = await supabase.createNewStatement(sanitizeQuery(route.query.q as string));
    console.log('New statement created:', new_statement);
    void router.push(`/statement/${new_statement.id}`);
  } catch (error) {
    console.error('Create new statement error:', error);
    errorMessage.value = error as PostgrestError;
  }
};


// Watch for route query changes only
watch(
  () => route.query.q,
  async (newQuery) => {
    if (typeof newQuery === 'string') {
      try {
        await searchStatements(newQuery);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <q-list>
    <template v-if="authStore.user">
      <!-- Create New Statement-->
      <q-item class="column items-center">
        <q-item-section>
          <h6 class="q-my-none">Create New Statement</h6>
        </q-item-section>
        <q-item-section>
          <q-card>
            <q-card-section>
              <div class="text-weight-bold">
                {{ sanitizeQuery(route.query.q as string) }}
              </div>
            </q-card-section>
          </q-card>
        </q-item-section>
        <q-item-section>
          <q-card-section v-if="errorMessage">
            <div class="text-negative">{{ errorMessage.message }}</div>
          </q-card-section>
        </q-item-section>
        <q-item-section>
          <q-card-actions>
            <q-btn label="Create Statement" color="primary" @click="createNewStatement" />
          </q-card-actions>
        </q-item-section>
      </q-item>
    </template>
    <template v-else>
      <q-item>
        <q-item-section>
          <h6 class="q-my-none">Login to Create New Statement</h6>
        </q-item-section>
      </q-item>
    </template>

    <q-separator />
    <!-- Search results header -->
    <q-item class="row justify-between items-center">
      <h6 class="q-my-none">Existing Similar Statements</h6>
      <q-select dense outlined v-model="sortMethod" :options="SORT_OPTIONS" label="Sort by" class="q-ml-md" />
    </q-item>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center q-my-xl">
      <q-spinner-dots color="primary" size="42px" />
    </div>

    <!-- No results state -->
    <div v-else-if="!statements.length" class="text-center q-my-xl text-grey-7">
      No results found.
    </div>

    <!-- Results list -->

    <template v-for="statement in paginatedStatements" :key="statement.id">
      <StatementComponent :statement="statement" bottomStats />
    </template>
  </q-list>

  <!-- Pagination -->
  <div v-if="statements.length" class="flex justify-center q-mt-lg">
    <q-pagination v-model="currentPage" :max="totalPages" :max-pages="6" boundary-numbers direction-links
      color="primary" active-color="primary" />
  </div>
</template>
