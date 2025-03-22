<script setup lang="ts">
import { ref, watch, PropType, computed } from 'vue';
import { useSupabase } from '@/composables/useSupabase';
import ArgumentComponent from './ArgumentComponent.vue';
import { Statement, StatementType, Argument } from '@/types/types';

/**
 * Props for ConnectedStatements component
 * @property {number} statementId - The ID of the parent statement
 * @property {StatementType} statementType - Type of relationship ('OPPOSES' or 'SUPPORTS')
 */
const props = defineProps({
  conclusion_id: {
    type: Number,
    required: true
  },
  statementType: {
    type: String as PropType<StatementType>,
    required: true
  }
});

// Emit events for parent component communication
const emit = defineEmits(['select']);

// Component state management
const argumentsList = ref<Argument[]>([]);
const isLoading = ref(false);
const { fetchArguments_by_conclusion } = useSupabase();

// Filter state
const hideVotedArguments = ref(false);

/**
 * Computed property to filter statements based on user votes
 */
const filteredArguments = computed(() => {
  if (!hideVotedArguments.value) {
    return argumentsList.value;
  }
  return argumentsList.value.filter(argument => argument.users_vote === null);
});

/**
 * Handles selection of a statement and emits the selected statement to parent
 * @param {Statement} statement - The selected statement object
 */
const handleSelect = (statement: Statement) => {
  console.log('handleSelect', statement);
  emit('select', statement);
};

/**
 * Updates a statement in the list when vote changes
 */
const handleVoteUpdate = (updatedArgument: Argument) => {
  const index = argumentsList.value.findIndex(a => a.id === updatedArgument.id);
  if (index !== -1) {
    argumentsList.value[index] = updatedArgument;
  }
};

/**
 * Watch for changes in statementId prop and fetch related statements
 * Sets loading state during fetch operation
 */
watch(
  () => props.conclusion_id,
  async () => {
    isLoading.value = true;
    try {
      argumentsList.value = await fetchArguments_by_conclusion(
        props.conclusion_id,
        props.statementType,
        0,
        10
      );
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

</script>

<template>
  <div class="arguments-container">
    <div class="flex flex-col items-center p-4">
      <h1>{{ statementType === 'OPPOSES' ? 'Opposing' : 'Supporting' }} Arguments</h1>
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          v-model="hideVotedArguments"
          class="form-checkbox"
        >
        Hide voted
      </label>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-gray-500 text-sm p-2">
      Loading...
    </div>

    <!-- Arguments list -->
    <div v-else-if="filteredArguments.length > 0">
      <div v-for="argument in filteredArguments" :key="argument.id" class="argument-wrapper">
        <div class="flex flex-col">
          <p>{{ argument.title }} by {{ argument.username }}</p>
          <p>{{ argument.argument_type }}</p>
        </div>
        <div class="flex flex-row">
          <p>{{ argument.upvotes - argument.downvotes }}</p>
          <VoteControls :argument="argument" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-gray-500 text-sm p-2">
      No arguments found.
    </div>
  </div>
</template>

<style scoped>
.argument-wrapper {
  border-bottom: 1px solid #eee;
}

.argument-wrapper:last-child {
  border-bottom: none;
}
</style>
