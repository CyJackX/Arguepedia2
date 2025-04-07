<script setup lang="ts">
import type { Argument } from '../types/models';
import ArgumentComponent from './ArgumentComponent.vue';
import type { StatementType } from '../types/models';
import { ref, watchEffect } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import { useStatementStore } from '../stores/statementStore';
import CreateArgumentComponent from './CreateArgumentComponent.vue';
const statementStore = useStatementStore();
const argumentList = ref<Argument[]>([]);
const supabase = useSupabase();

const props = defineProps<{
  argument_type: StatementType;
}>();

// Option 1: Proper error and loading handling
watchEffect(() => {
  // The effect itself is synchronous

  // The async work is moved into a separate promise
  supabase.fetchArguments_by_conclusion(statementStore.currentStatement?.id as number, props.argument_type)
    .then(results => {
      argumentList.value = results;
    })
    .catch(error => {
      console.error('Failed to fetch arguments:', error);
    })
});
</script>

<template>
  <q-list>
    <q-item class="row justify-center">
      <CreateArgumentComponent :argument_type="argument_type" />
    </q-item>
    <template v-if="argumentList.length">
      <q-item v-for="argument in argumentList" :key="argument.id">
        <ArgumentComponent :argument="argument" />
      </q-item>
    </template>
    <template v-else>
      <div>No {{ argument_type === 'SUPPORTS' ? 'Supporting' : 'Opposing' }} Arguments! Make one?</div>
    </template>
  </q-list>
</template>
