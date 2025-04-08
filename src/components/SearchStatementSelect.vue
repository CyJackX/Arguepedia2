// src/components/SearchStatementSelect.vue
<script setup lang="ts">
import { ref } from 'vue';
import type { Statement } from '../types/models';
import StatementComponent from './StatementComponent.vue';
import { useStatementCreation } from '../composables/useStatementCreation';
import { useSupabase } from '../composables/useSupabase';

const supabase = useSupabase();
const { createNewStatement, sanitizeQuery, errorMessage, friendlyErrorMessage } = useStatementCreation();

const searchInput = ref('');
const options = ref<Statement[]>([]);
const isMenuOpen = ref(false);
const isLoading = ref(false);

const searchStatements = async () => {
  isLoading.value = true;
  if (!searchInput.value) {
    options.value = [];
    return;
  }
  try {
    const [statements] = await supabase.searchStatements(
      searchInput.value,
      0,
      5,
      'similarity'
    );
    options.value = statements;
    isMenuOpen.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleCreateNewStatement = async () => {
  try {
    const newStatement = await createNewStatement(searchInput.value);
    if (newStatement) {
      emit('select', newStatement);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isMenuOpen.value = false;
  }
}


// Emit the selected statement
const emit = defineEmits<{
  (e: 'select', statement: Statement): void
}>();
</script>

<template>
  <q-input :loading="isLoading" v-model="searchInput" type="search"
    placeholder="Search statements or create your own..." @update:model-value="searchStatements" debounce="300" dense
    bg-color="white" maxlength="140" counter :error="errorMessage !== null" :error-message="friendlyErrorMessage"
    @error="isMenuOpen = false">

    <q-menu fit v-model="isMenuOpen" no-focus>
      <q-list>
        <StatementComponent clickable @click="emit('select', statement)" sideStats v-for="statement in options"
          :key="statement.id" :statement="statement" />
        <q-item v-if="sanitizeQuery(searchInput).length > 0">
          <q-item-section>
            <q-item-label>
              <q-btn class="full-width" align="left" no-caps flat @click="handleCreateNewStatement">Create new
                statement:
                <br>
                {{ sanitizeQuery(searchInput) }}
              </q-btn>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-input>

</template>