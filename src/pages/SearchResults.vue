<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import type { Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../types/models';
import StatementComponent from '../components/StatementComponent.vue'
import { useAuthStore } from '../stores/authStore';
import type { PostgrestError } from '@supabase/supabase-js';

const route = useRoute();
const supabase = useSupabase();
const searchResults = ref<Statement[]>([]);
const itemsPerPage = 10;
const currentPage = ref(1);
const totalResults = ref(0);
const totalPages = computed(() => Math.ceil(totalResults.value / itemsPerPage));
const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref<PostgrestError | null>(null);

const { searchTerm, searchTrigger } = inject('search') as {
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

const loadStatements = async (page: number = currentPage.value) => {
  if (!searchTerm.value) return;

  // Check if page is already in cache
  const cachedPage = pageCache.value.get(page);
  if (cachedPage) {
    console.log('Cache hit for page', page);
    searchResults.value = cachedPage;
    return;
  }

  try {
    const offset = (page - 1) * itemsPerPage;
    const [statements, total] = await supabase.searchStatements(
      searchTerm.value,
      offset,
      itemsPerPage,
      sortMethod.value.value // Pass just the value string
    );

    // Cache the results
    pageCache.value.set(page, statements);
    searchResults.value = statements;
    totalResults.value = total;
  } catch (error) {
    console.error('Error loading statements:', error);
    searchResults.value = [];
  }
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

const resetSearch = () => {
  searchResults.value = [];
  totalResults.value = 0;
  currentPage.value = 1;
  pageCache.value.clear(); // Clear the cache on new search
};

// Watch for both route changes and search triggers
watch(
  [() => route.query.q, searchTrigger],
  async ([newQuery]) => {
    if (typeof newQuery === 'string') {
      try {
        resetSearch();
        await loadStatements();
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  },
  { immediate: true }
);

watch(sortMethod, () => {
  console.log('Sort method changed:', sortMethod.value);
  resetSearch();
  void loadStatements();
});
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
      <q-select behavior="menu" transition-duration="0" options-dense outlined v-model="sortMethod"
        :options="SORT_OPTIONS" label="Sort by" class="q-ml-md" />
    </q-item>

    <!-- Results list -->

    <template v-for="statement in paginatedStatements" :key="statement.id">
      <StatementComponent :statement="statement" bottomStats />
    </template>
  </q-list>

  <!-- Pagination -->
  <div v-if="searchResults.length" class="flex justify-center q-mt-lg">
    <q-pagination v-model="currentPage" :max="totalPages" :max-pages="6" boundary-numbers direction-links
      color="primary" active-color="primary" @update:model-value="loadStatements" />
  </div>
</template>
