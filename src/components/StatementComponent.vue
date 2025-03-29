<script setup lang="ts">
import type { Statement } from './models';
import { useStatementStore } from '../stores/statementStore';
import { useRouter } from 'vue-router';
import UsernameButton from './UsernameButton.vue';
const statementStore = useStatementStore();
const router = useRouter();

defineProps<{
  statement: Statement;
  showStats?: boolean;
}>()

const navigateToStatement = async (statement: Statement) => {
  if (!statement) return;
  statementStore.setCurrentStatement(statement);
  try {
    await router.push(`/statement/${statement.id}`);
  } catch (error) {
    console.error('Navigation error:', error);
  }
};
</script>

<template>
  <q-item clickable @click="navigateToStatement(statement)">
    <q-item-section>
      <q-item-label style="font-weight: bold">{{ statement.statement_text }}</q-item-label>
      <q-item-label caption v-if="showStats">
        <q-icon color="green" name="check" /> {{ statement.supporting_arguments_count }} | <q-icon color="red"
          name="close" />
        {{ statement.opposing_arguments_count }} | <q-icon name="comment" /> {{ statement.comments_count }}
        <br>Created by
        <UsernameButton :username="statement.username" /> on {{ new Date(statement.created_at).toLocaleString() }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>
