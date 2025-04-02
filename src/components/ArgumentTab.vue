<script setup lang="ts">
import type { Argument } from '../types/models';
import ArgumentComponent from './ArgumentComponent.vue';
import type { StatementType } from '../types/models';
import { ref, watchEffect } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const argumentList = ref<Argument[]>([]);
const supabase = useSupabase();
const isLoading = ref(false);
const props = defineProps<{
  statementId: number;
  type: StatementType;
}>();

// Option 1: Proper error and loading handling
watchEffect(() => {
  // The effect itself is synchronous
  isLoading.value = true;

  // The async work is moved into a separate promise
  supabase.fetchArguments_by_conclusion(props.statementId, props.type)
    .then(results => {
      argumentList.value = results;
    })
    .catch(error => {
      console.error('Failed to fetch arguments:', error);
    })
    .finally(() => {
      isLoading.value = false;
    });
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="argumentList.length">
    <ArgumentComponent v-for="argument in argumentList" :key="argument.id" :argument="argument" />
  </div>
  <div v-else>No {{ type === 'SUPPORTS' ? 'Supporting' : 'Opposing' }} Arguments! Make one?</div>
</template>
