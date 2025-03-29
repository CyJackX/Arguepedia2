<script setup lang="ts">
import type { Statement } from '../components/models';
import { useStatementStore } from '../stores/statementStore';
import { useRouter } from 'vue-router';

const statementStore = useStatementStore();
const router = useRouter();

defineProps<{
  statement: Statement;
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
      <q-item-label caption>
        <q-icon color="green" name="check" /> {{ statement.supporting_arguments_count }} | <q-icon color="red"
          name="close" />
        {{ statement.opposing_arguments_count }} | <q-icon name="comment" /> {{ statement.comments_count }}
        <br>Created by {{ statement.username }} on {{ new Date(statement.created_at).toLocaleString() }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>
