<script setup lang="ts">
import type { Argument, Statement, RelatedStatement } from '../types/models';
import { ref } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import UsernameButton from './UsernameButton.vue';

const props = defineProps<{
  argument: Argument;
}>();

const conclusion = ref<Statement | null>(null);
const expanded = ref(false);
const isLoading = ref(false);
const { fetchStatement, fetchConnectedStatements } = useSupabase();
const argumentStatements = ref<RelatedStatement[]>([]);

const handleBeforeShow = async () => {
  isLoading.value = true;
  try {
    conclusion.value = await fetchStatement(props.argument.conclusion_id);
    argumentStatements.value = await fetchConnectedStatements(props.argument.id);
  } catch (error) {
    console.error('Failed to fetch conclusion:', error);
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <q-card bordered>
    <q-expansion-item expand-icon-toggle dense dense-toggle v-model="expanded" @before-show="handleBeforeShow">
      <template #header>
        <q-item-section side class="col-auto">
          <div class="text-caption">
            <div class="col">
              <div class="col-auto">
                ↑
              </div>
              <div class="col-auto">
                {{ props.argument.upvotes - props.argument.downvotes }}
              </div>
              <div class="col-auto">
                ↓
              </div>
            </div>
          </div>
        </q-item-section>
        <q-item-section>
          <div class="text-body1 text-weight-bold">{{ props.argument.title }}</div>
          <div class="text-caption">by
            <UsernameButton :username="props.argument.username" />
          </div>

        </q-item-section>

      </template>
      <q-list dense separator outlined>
        <q-item v-for="statement in argumentStatements" :key="statement.id">
          <q-item-section>
            <q-item-label>{{ statement.statement_text }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Therefore: {{ conclusion?.statement_text }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-card>
</template>
