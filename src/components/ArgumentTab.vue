<script setup lang="ts">
import type { Argument } from './models';
import ArgumentComponent from './ArgumentComponent.vue';
import type { StatementType } from './models';
import { ref, onMounted } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const argumentList = ref<Argument[]>([]);
const supabase = useSupabase();

const props = defineProps<{
  statementId: number;
  type: StatementType;
}>();

onMounted(async () => {
  argumentList.value = await supabase.fetchArguments_by_conclusion(props.statementId, props.type);
});
</script>

<template>
  <div v-if="argumentList.length">
    <ArgumentComponent v-for="argument in argumentList" :key="argument.id" :argument="argument" />
  </div>
  <div v-else>No {{ type === 'SUPPORTS' ? 'Supporting' : 'Opposing' }} Arguments! Make one?</div>
</template>