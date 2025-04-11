<script setup lang="ts">

import { ref, computed } from 'vue';
import { useStatementStore } from '../stores/statementStore';
import type { Statement, Argument } from '../types/models';
import { useAuthStore } from '../stores/authStore';
import UsernameButton from './UsernameButton.vue';
import StatementComponent from './StatementComponent.vue';
import SearchStatementSelect from './SearchStatementSelect.vue';
import { useArgumentCreation } from '../composables/useArgumentCreation';
import type { StatementType } from 'src/types/models';
import type { PostgrestError } from '@supabase/supabase-js';

const emit = defineEmits<{
  (e: 'argumentCreated', argument: Argument): void
}>();
const props = defineProps<{
  argument_type: StatementType;
}>();

const { createNewArgument, errorMessage } = useArgumentCreation();
const statementStore = useStatementStore();
const authStore = useAuthStore();
const statementsList = ref<(Statement | null)[]>([null]);
const conclusionLabel = computed(() => {
  return props.argument_type === 'SUPPORTS' ? 'supporting' : 'opposing';
});
const expanded = ref(false);
// const insetLevel = .67;
const titleRef = ref('');
const addStatement = () => {
  statementsList.value.push(null);
}

const removeStatement = (index: number) => {
  statementsList.value.splice(index, 1);
}

const handleStatementSelect = (index: number, statement: Statement) => {
  console.log('handleStatementSelect', index, statement);
  statementsList.value[index] = statement;
}

const resetArgument = () => {
  titleRef.value = '';
  statementsList.value = [null];
  errorMessage.value = null;
}
const submitArgument = async () => {
  statementsList.value = statementsList.value.filter(statement => statement !== null);
  try {
    console.log('submitArgument', titleRef.value, statementStore.currentStatement?.id, statementsList.value.map(statement => statement?.id), props.argument_type);
    const newArgument = await createNewArgument(titleRef.value, statementStore.currentStatement?.id as number, statementsList.value.map(statement => statement?.id as number), props.argument_type);
    console.log('newArgument', newArgument);
    resetArgument();
    expanded.value = false;
    emit('argumentCreated', newArgument);
  } catch (error) {
    console.error('Error submitting argument:', error);
    errorMessage.value = error as PostgrestError;
  }
}

</script>

<template>
  <q-card bordered class="full-width">
    <q-expansion-item expand-separator expand-icon-toggle dense dense-toggle v-model="expanded">
      <template #header>
        <q-item-section side class="col-auto" style="width: 38.53px;">
          <div class="text-caption">
            <div class="col">
              <div class="col-auto">
                ↑
              </div>
              <div class="col-auto">
                0
              </div>
              <div class="col-auto">
                ↓
              </div>
            </div>
          </div>
        </q-item-section>
        <q-item-section>
          <div class="text-body1 text-weight-bold" v-if="!expanded">Create an argument</div>
          <q-input dense v-if="expanded" v-model="titleRef" placeholder="Title" />
          <div class="text-caption" v-if="expanded">by
            <UsernameButton :username="authStore.userProfile?.username as string" />
          </div>

        </q-item-section>

      </template>

      <template #default>
        <q-list dense separator>
          <q-separator />
          <template v-for="(premise, index) in statementsList" :key="index">
            <div class="row">
              <StatementComponent class="col-grow" sideStats flat :statement="premise">
                <SearchStatementSelect @select="handleStatementSelect(index, $event)" />
              </StatementComponent>
              <q-btn flat @click="removeStatement(index)"><q-icon name="close" /></q-btn>
            </div>
            <q-separator />
          </template>
          <q-list dense separator style="padding-left: 38px;">
            <q-item>
              <q-item-section>
                <q-btn flat padding="none" @click="addStatement">
                  <q-icon name="add" /> Add another statement
                </q-btn>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Thereby {{ conclusionLabel }} the conclusion:</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>{{ statementStore.currentStatement?.statement_text }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="column">
              <q-item-section class="row inline">
                <q-btn-group outline flat spread>
                  <q-btn @click="submitArgument"><q-icon name="check" /> Submit Argument</q-btn>
                  <q-btn @click="resetArgument"><q-icon name="close" /> Reset Argument</q-btn>
                </q-btn-group>
              </q-item-section>
              <q-item-section>
                <q-item-label v-if="errorMessage" class="text-negative text-center">
                  {{ errorMessage.message }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-list>
      </template>
    </q-expansion-item>
  </q-card>
</template>
