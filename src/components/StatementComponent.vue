<script setup lang="ts">
import type { Statement } from '../types/models';
import { useRouter } from 'vue-router';
import UsernameButton from './UsernameButton.vue';
import { useStatementStore } from '../stores/statementStore';
const router = useRouter();
const statementStore = useStatementStore();

const props = defineProps<{
  statement: Statement;
  bottomStats?: boolean;
  sideStats?: boolean;
  bold?: boolean;
  insetLevel?: number;
  flat?: boolean;
  bordered?: boolean;
}>()

const navigateToStatement = () => {
  statementStore.setCurrentStatement(props.statement);
  void router.push(`/statement/${props.statement.id}`);
}

</script>

<template>
  <q-card class="q-mb-sm" :flat="flat">
    <!-- Top stats -->
    <q-item clickable @click="navigateToStatement" :inset-level="insetLevel">
      <q-item-section side class="text-caption" v-if="sideStats">
        <q-item-label>
          <q-icon color="green" name="check" /> {{ statement.supporting_arguments_count }}
        </q-item-label>
        <q-item-label>
          <q-icon color="red" name="close" /> {{ statement.opposing_arguments_count }}
        </q-item-label>
        <q-item-label>
          <q-icon name="comment" /> {{ statement.comments_count }}
        </q-item-label>
      </q-item-section>

      <!-- Statement text -->
      <q-item-section>
        <q-item-label :style="{ fontWeight: bold ? 'bold' : 'normal' }">{{ statement.statement_text }}</q-item-label>

        <!-- Bottom stats -->
        <q-item-label caption v-if="bottomStats">
          <q-icon color="green" name="check" /> {{ statement.supporting_arguments_count }} | <q-icon color="red"
            name="close" />
          {{ statement.opposing_arguments_count }} | <q-icon name="comment" /> {{ statement.comments_count }}
          <br>Created by
          <UsernameButton :username="statement.username" /> on {{ new Date(statement.created_at).toLocaleString() }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>
