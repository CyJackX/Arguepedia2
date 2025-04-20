<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../types/models';
import StatementComponent from '../components/StatementComponent.vue';
import CreateStatement from '../components/CreateStatement.vue';
import { useStatementStore } from '../stores/statementStore';
import { useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const statementStore = useStatementStore();
const searchResults = ref<Statement[]>([]);
const itemsPerPage = 10;
const currentPage = ref(1);
const totalResults = ref(0);
const totalPages = computed(() => Math.ceil(totalResults.value / itemsPerPage));
const isLoading = ref(false);

const { searchTerm } = inject('search') as {
  searchTerm: Ref<string>,
  searchTrigger: Ref<number>
};

const SORT_OPTIONS = [
  { value: 'similarity', label: 'Most Relevant' },
  { value: 'created_at', label: 'Newest First' },
  { value: 'comments_count', label: 'Most Comments' },
  { value: 'supporting_arguments_count', label: 'Most Supporting' },
  { value: 'opposing_arguments_count', label: 'Most Opposing' },
  { value: 'even_support', label: 'Most Evenly Argued' }
] as const;

const sortMethod = ref<typeof SORT_OPTIONS[number]>(SORT_OPTIONS[0]);

// Compute current page of statements - no sorting needed anymore
const paginatedStatements = computed(() => searchResults.value);

// Cache structure to store already loaded pages
const pageCache = ref<Map<number, Statement[]>>(new Map());

const loadSearchResults = async (page: number = currentPage.value) => {
  if (!searchTerm.value) return;

  // Check if page is already in cache
  const cachedPage = pageCache.value.get(page);
  if (cachedPage) {
    console.log('Cache hit for page', page);
    searchResults.value = cachedPage;
    return;
  }

  try {
    console.log('Starting search, setting isLoading to true');
    isLoading.value = true;
    const offset = (page - 1) * itemsPerPage;
    const [statements, total] = await supabase.searchStatements(
      searchTerm.value,
      offset,
      itemsPerPage,
      sortMethod.value.value
    );

    console.log('Search completed, results:', { statements, total });
    // Cache the results
    pageCache.value.set(page, statements);
    searchResults.value = statements;
    totalResults.value = total;
  } catch (error) {
    console.error('Error loading statements:', error);
    searchResults.value = [];
  } finally {
    console.log('Search finished, setting isLoading to false');
    isLoading.value = false;
  }
};
const resetSearch = () => {
  searchResults.value = [];
  totalResults.value = 0;
  currentPage.value = 1;
  pageCache.value.clear(); // Clear the cache on new search
};

const newSearch = async () => {
  resetSearch();
  await loadSearchResults();
}

// Watch for route changes only
watch(
  () => route.query.q,
  async (newQuery) => {
    console.log('🔍 SearchResults - watcher triggered', { newQuery });
    if (typeof newQuery === 'string') {
      try {
        console.log('🔍 SearchResults - starting newSearch');
        await newSearch();
        console.log('🔍 SearchResults - newSearch completed');
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  },
  { immediate: true }
);

const navigateToStatement = (statement: Statement) => {
  statementStore.setCurrentStatement(statement);
  void router.push(`/statement/${statement?.id}`);
}

</script>

<template>
  <q-list>
    <CreateStatement />

    <q-separator />
    <!-- Search results header -->
    <q-item class="row justify-between items-center">
      <h6 class="q-my-none">Existing Similar Statements</h6>
      <q-select behavior="menu" transition-duration="0" options-dense outlined v-model="sortMethod"
        @update:model-value="newSearch" :options="SORT_OPTIONS" label="Sort by" class="q-ml-md" />
    </q-item>

    <!-- Results list -->
    <template v-if="isLoading">
      <q-skeleton height="100px" class="q-mb-sm" />
    </template>
    <template v-else-if="totalResults > 0">
      <template v-for="statement in paginatedStatements" :key="statement.id">
        <q-card class="q-mb-sm" bordered>
          <StatementComponent clickable @click="navigateToStatement(statement)" bottomStats :statement="statement" />
        </q-card>
      </template>
    </template>
    <template v-else>
      <div>No results found</div>
    </template>
    <!-- Pagination -->
    <q-pagination v-if="totalResults > 0" class="flex justify-center q-mt-lg" v-model="currentPage" :max="totalPages"
      :max-pages="6" boundary-numbers direction-links color="primary" active-color="primary"
      @update:model-value="loadSearchResults" />
  </q-list>



</template>
