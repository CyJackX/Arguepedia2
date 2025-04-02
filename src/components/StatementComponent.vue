<script setup lang="ts">
import type { Statement } from '../types/models';
import { useRouter } from 'vue-router';
import UsernameButton from './UsernameButton.vue';
const router = useRouter();

defineProps<{
  statement: Statement;
  bottomStats?: boolean;
  sideStats?: boolean;
  bold?: boolean;
  insetLevel?: number;
}>()

</script>

<template>
  <q-item clickable @click="() => router.push(`/statement/${statement.id}`)" :inset-level="insetLevel">
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
    <q-item-section>
      <q-item-label :style="{ fontWeight: bold ? 'bold' : 'normal' }">{{ statement.statement_text }}</q-item-label>

      <q-item-label caption v-if="bottomStats">
        <q-icon color="green" name="check" /> {{ statement.supporting_arguments_count }} | <q-icon color="red"
          name="close" />
        {{ statement.opposing_arguments_count }} | <q-icon name="comment" /> {{ statement.comments_count }}
        <br>Created by
        <UsernameButton :username="statement.username" /> on {{ new Date(statement.created_at).toLocaleString() }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>
