<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../types/models';
import StatementComponent from '../components/StatementComponent.vue'

const route = useRoute();
const supabase = useSupabase();
const isLoading = ref(true);
const statements = ref<Statement[]>([]);
const itemsPerPage = 10;
const maxResults = 50; // Set total results to return from backend, pagination client-side.
const currentPage = ref(1);
// Compute total pages based on actual results
const totalPages = computed(() => Math.ceil(statements.value.length / itemsPerPage));

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
  <div class="q-pa-md">
    <div class="row justify-between items-center">
      <h6 class="q-my-none">Search Results</h6>
      <q-select dense outlined v-model="sortMethod" :options="SORT_OPTIONS" label="Sort by" class="q-ml-md" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center q-my-xl">
      <q-spinner-dots color="primary" size="42px" />
    </div>

    <!-- No results state -->
    <div v-else-if="!statements.length" class="text-center q-my-xl text-grey-7">
      No results found
    </div>

    <!-- Results list -->
    <q-list dense v-else separator padding>
      <template v-for="statement in paginatedStatements" :key="statement.id">
        <StatementComponent :statement="statement" bottomStats />
      </template>
    </q-list>

    <!-- Pagination -->
    <div v-if="statements.length" class="flex justify-center q-mt-lg">
      <q-pagination v-model="currentPage" :max="totalPages" :max-pages="6" boundary-numbers direction-links
        color="primary" active-color="primary" />
    </div>
  </div>
</template>
