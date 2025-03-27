<script setup lang="ts">
import type { Argument, Statement } from './models';
import { ref, watch } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const props = defineProps<{
  argument: Argument;
}>();

const conclusion = ref<Statement | null>(null);
const expanded = ref(false);
const isLoading = ref(false);
const { fetchStatement, fetchConnectedStatements } = useSupabase();
const argumentStatements = ref<Statement[]>([]);

// Add watch to fetch the statement when expanded
watch(expanded, async (newValue) => {
  if (newValue) {
    isLoading.value = true;
    try {
      conclusion.value = await fetchStatement(props.argument.conclusion_id);
      argumentStatements.value = await fetchConnectedStatements(props.argument.id);
    } catch (error) {
      console.error('Failed to fetch conclusion:', error);
    } finally {
      isLoading.value = false;
    }
  }
});

</script>

<template>
  <q-card bordered>
    <q-expansion-item v-model="expanded">
      <template #header>
        <q-item-section>
          <div class="text-body1 text-weight-bold">{{ props.argument.title }}</div>
          <div class="text-caption">by {{ props.argument.username }}</div>
          <div class="text-caption">
            <b>↑</b>{{ props.argument.upvotes - props.argument.downvotes }}<b>↓</b>
          </div>
        </q-item-section>
      </template>
      <q-list dense separator outlined>
        <q-item v-for="statement in argumentStatements" :key="statement.id">
          <q-item-section>
            <q-item-label>{{ statement.statement_text }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Therefore: {{ conclusion?.statement_text }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-card>
</template>
