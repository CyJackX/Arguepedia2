<template>
  <div class="q-pa-md">
    <h6>Search Results</h6>
    <q-list bordered separator>
      <q-item v-for="statement in statements" :key="statement.id">
        <q-item-section>
          <q-item-label>{{ statement.statement_text }}</q-item-label>
          <q-item-label caption>
            <q-icon name="check" /> {{ statement.supporting_arguments_count }} | <q-icon name="close" />
            {{ statement.opposing_arguments_count }}
            <br>Created by: {{ statement.username }} on {{ new Date(statement.created_at).toLocaleString() }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../components/models';

const route = useRoute();
const supabase = useSupabase();
const statements = ref<Statement[]>([]);

const searchStatements = async (query: string) => {
  if (!query) return;
  const results = await supabase.searchStatements(query, 0, 10);
  statements.value = results;
};

// Watch for route query changes
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
