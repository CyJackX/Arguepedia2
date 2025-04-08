<script setup lang="ts">

import { ref, computed } from 'vue';
import { useStatementStore } from '../stores/statementStore';
import type { Statement } from '../types/models';
import { useAuthStore } from '../stores/authStore';
import UsernameButton from './UsernameButton.vue';
import StatementComponent from './StatementComponent.vue';
import SearchStatementSelect from './SearchStatementSelect.vue';

const props = defineProps<{
  argument_type: string;
}>();


const statementStore = useStatementStore();
const authStore = useAuthStore();
const statementsList = ref<(Statement | null)[]>([null]);
const conclusionLabel = computed(() => {
  return props.argument_type === 'SUPPORTS' ? 'supporting' : 'opposing';
});
const expanded = ref(false);
const insetLevel = .67;

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

const submitArgument = () => {
  console.log('submitArgument', statementsList.value);
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
          <div class="text-body1 text-weight-bold">Create an argument</div>
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
          <q-list separator style="padding-left: 38px;">
            <q-item>
              <q-item-section>
                <q-btn flat align="left" padding="none" @click="addStatement">
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

            <q-item>
              <q-item-section>
                <q-item-label class="items-center">
                  <q-btn flat padding="none"><q-icon name="check" /> Submit Argument</q-btn>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-list>
      </template>
    </q-expansion-item>
  </q-card>
</template>
