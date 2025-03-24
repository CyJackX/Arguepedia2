<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../components/models';
import { useStatementStore } from '../stores/statementStore';

const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const statements = ref<Statement[]>([]);
const itemsPerPage = 10;
const maxResults = 50; // Set total results to return from backend, pagination client-side.
const currentPage = ref(1);
const statementStore = useStatementStore();
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
  const results = await supabase.searchStatements(query, 0, maxResults);
  statements.value = results;
  currentPage.value = 1; // Reset to first page on new search
};

const navigateToStatement = async (statement: Statement) => {
  if (!statement) return;
  statementStore.setCurrentStatement(statement);
  try {
    await router.push(`/statement/${statement.id}`);
  } catch (error) {
    console.error('Navigation error:', error);
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
  <div class="q-pa-md">
    <div class="row justify-between items-center">
      <h6>Search Results</h6>
      <q-select dense v-model="sortMethod" :options="SORT_OPTIONS" label="Sort by" />
    </div>
    <q-list bordered separator>
      <q-item clickable v-for="statement in paginatedStatements" :key="statement.id"
        @click="navigateToStatement(statement)">
        <q-item-section>
          <q-item-label style="font-weight: bold">{{ statement.statement_text }}</q-item-label>
          <q-item-label caption>
            <q-icon color="green" name="check" /> {{ statement.supporting_arguments_count }} | <q-icon color="red"
              name="close" />
            {{ statement.opposing_arguments_count }} | <q-icon name="comment" /> {{ statement.comments_count }}
            <br>Created by {{ statement.username }} on {{ new Date(statement.created_at).toLocaleString() }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Only show pagination if we have items -->
    <div v-if="statements.length" class="flex justify-center q-mt-md">
      <q-pagination v-model="currentPage" :max="totalPages" :max-pages="6" boundary-numbers direction-links />
    </div>
  </div>
</template>