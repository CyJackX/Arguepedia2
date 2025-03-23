<template>
  <div class="q-pa-md">
    <h6>Search Results</h6>
    <q-list bordered separator>
      <q-item v-for="statement in paginatedStatements" :key="statement.id">
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../components/models';

const route = useRoute();
const supabase = useSupabase();
const statements = ref<Statement[]>([]);
const itemsPerPage = 10;
const maxResults = 50; // Set total results to return from backend, pagination client-side.
const currentPage = ref(1);

// Compute total pages based on actual results
const totalPages = computed(() => Math.ceil(statements.value.length / itemsPerPage));

// Compute current page of statements
const paginatedStatements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return statements.value.slice(start, end);
});

const searchStatements = async (query: string) => {
  if (!query) return;
  // Load 100 results at once
  const results = await supabase.searchStatements(query, 0, maxResults);
  statements.value = results;
  currentPage.value = 1; // Reset to first page on new search
};

// Watch for route query changes only
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string') {
      searchStatements(newQuery);
    }
  },
  { immediate: true }
);
</script>
