<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, watch } from 'vue';
import ArgumentComponent from '../components/ArgumentComponent.vue';
import CommentTab from '../components/CommentTab.vue';
import { useStatementStore } from '../stores/statementStore';

const route = useRoute();
const statementStore = useStatementStore();
const argumentId = computed(() => parseInt(route.params.id as string));

watch(argumentId, async (newId) => {
  if (statementStore.currentArgument?.id === newId) {
    return;
  }
  await statementStore.fetchArgument(newId);
}, { immediate: true });
</script>

<template>
  <template v-if="statementStore.currentArgument">
    <ArgumentComponent :argument="statementStore.currentArgument" />
    <CommentTab :parent_id="statementStore.currentArgument.id" parent_type="argument" />
  </template>
</template>
