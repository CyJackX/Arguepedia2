<script setup lang="ts">
import type { Argument, Statement } from '../types/models';
import { ref, computed } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import UsernameButton from './UsernameButton.vue';
import StatementComponent from './StatementComponent.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
  argument: Argument;
}>();

const conclusion = ref<Statement | null>(null);
const expanded = ref(false);
const isLoading = ref(false);
const { fetchStatement, fetchConnectedStatements } = useSupabase();
const argumentStatements = ref<Statement[]>([]);
const conclusionLabel = computed(() => {
  return props.argument.argument_type === 'SUPPORTS' ? 'supporting' : 'opposing';
});
const argumentStatementById = (id: number) => {
  return argumentStatements.value.find(s => s.id === id);
};

const handleBeforeShow = async () => {
  isLoading.value = true;
  try {
    [conclusion.value, argumentStatements.value] = await Promise.all([
      fetchStatement(props.argument.conclusion_id),
      fetchConnectedStatements(props.argument.statement_array)
    ]);
  } catch (error) {
    console.error('Failed to fetch conclusion:', error);
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <q-card bordered>
    <q-expansion-item expand-separator expand-icon-toggle dense dense-toggle v-model="expanded"
      @before-show="handleBeforeShow">
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
          <div @click="() => router.push(`/argument/${props.argument.id}`)" class="text-body1 text-weight-bold">{{
            props.argument.title }}</div>
          <div class="text-caption">by
            <UsernameButton :username="props.argument.username" />
          </div>

        </q-item-section>

      </template>
      <q-list v-if="!isLoading" dense separator outlined>
        <template v-for="statementId in argument.statement_array" :key="statementId">
          <StatementComponent v-if="argumentStatementById(statementId)" sideStats
            :statement="argumentStatementById(statementId) as Statement" />
          <q-item v-else :inset-level=.67>
            <q-item-section>
              <q-item-label class="text-weight-bold">Statement ID: {{ statementId }} not found!</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <q-item :inset-level=.67>
          <q-item-section>
            <q-item-label>Thereby {{ conclusionLabel }} the conclusion:</q-item-label>
          </q-item-section>
        </q-item>
        <q-item :inset-level=.67>
          <q-item-section>
            <q-item-label>{{ conclusion?.statement_text }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-card>
</template>
