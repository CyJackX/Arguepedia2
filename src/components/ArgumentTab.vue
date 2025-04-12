<script setup lang="ts">
import type { Argument } from '../types/models';
import ArgumentComponent from './ArgumentComponent.vue';
import type { StatementType } from '../types/models';
import { ref, computed, watch, onMounted } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import { useStatementStore } from '../stores/statementStore';
import CreateArgumentComponent from './CreateArgumentComponent.vue';

const statementStore = useStatementStore();
const argumentList = ref<Argument[]>([]);
const supabase = useSupabase();

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = computed(() =>

  props.argument_type === 'SUPPORTS' ? statementStore.currentStatement?.supporting_arguments_count : statementStore.currentStatement?.opposing_arguments_count
);
const isLoading = ref(false);

const props = defineProps<{
  argument_type: StatementType;
}>();

// Fetch arguments with pagination
const fetchArguments = async (page: number) => {
  if (!statementStore.currentStatement?.id) return;

  isLoading.value = true;
  try {
    const offset = (page - 1) * itemsPerPage.value;
    const data = await supabase.fetchArguments_by_conclusion(
      statementStore.currentStatement.id,
      props.argument_type,
      offset,
      itemsPerPage.value
    );

    argumentList.value = data;

  } catch (error) {
    console.error('Failed to fetch arguments:', error);
  } finally {
    isLoading.value = false;
  }
};

// Better approach using watch instead of watchEffect
watch(
  () => statementStore.currentStatement?.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      console.log('statement Changed in store', newId);
      currentPage.value = 1;
      await fetchArguments(currentPage.value);
    }
  }
);
onMounted(async () => {
  await fetchArguments(currentPage.value);
});

const handlePageChange = async (page: number) => {
  console.log('handlePageChange', page);
  currentPage.value = page;
  await fetchArguments(page);
};

const handleArgumentCreated = async (argument: Argument) => {
  //This doesn't work with pagination to add the new argument to the top of the list
  argumentList.value.unshift(argument);
  statementStore.updateArgumentCount(props.argument_type, 1);
  currentPage.value = 1; // Reset to first page to show new argument
  await fetchArguments(1);
};
</script>

<template>
  <q-list>
    <q-item class="row justify-center">
      <CreateArgumentComponent :argument_type="argument_type" @argumentCreated="handleArgumentCreated" />
    </q-item>

    <q-inner-loading :showing="isLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <template v-if="argumentList.length">
      <q-item v-for="argument in argumentList" :key="argument.id">
        <ArgumentComponent :argument="argument" />
      </q-item>

      <!-- Pagination -->
      <q-item class="row justify-center q-mt-md">
        <q-pagination v-model="currentPage" :max="Math.ceil((totalItems ?? 0) / itemsPerPage)" :max-pages="5"
          boundary-numbers direction-links @update:model-value="handlePageChange" />
      </q-item>
    </template>
    <template v-else>
      <div class="text-center q-pa-md">
        No {{ argument_type === 'SUPPORTS' ? 'Supporting' : 'Opposing' }} Arguments! Make one?
      </div>
    </template>
  </q-list>
</template>
