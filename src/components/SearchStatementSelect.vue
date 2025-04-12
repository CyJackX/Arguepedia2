// src/components/SearchStatementSelect.vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Statement } from '../types/models';
import SideStats from './SideStats.vue';
import { useStatementCreation } from '../composables/useStatementCreation';
import { useSupabase } from '../composables/useSupabase';
import { QInput } from 'quasar';

const supabase = useSupabase();
const { createNewStatement, sanitizeQuery, errorMessage, friendlyErrorMessage } = useStatementCreation();

const searchInput = ref('');
const searchInputRef = ref<QInput | null>(null);
const options = ref<Statement[]>([]);
const isMenuOpen = ref(false);
const isLoading = ref(false);
const searchInputWidth = computed(() => {
  return `${searchInputRef.value?.$el?.offsetWidth ?? 0}px`;
});
const menuHasObjects = computed(() => {
  return options.value.length > 0 || sanitizeQuery(searchInput.value).length > 0;
});

const searchStatements = async () => {

  if (!searchInput.value) {
    options.value = [];
    return;
  }
  try {
    isLoading.value = true;
    const [statements] = await supabase.searchStatements(
      searchInput.value,
      0,
      5,
      'similarity'
    );
    options.value = statements;
    console.log('options', options.value);
  } catch (error) {
    console.error(error);
  } finally {
    isMenuOpen.value = true;
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
  <q-input ref="searchInputRef" :loading="isLoading" v-model="searchInput" type="search"
    placeholder="Search statements or create your own..." @update:model-value="searchStatements" debounce="300" dense
    bg-color="white" maxlength="140" counter :error="errorMessage !== null" :error-message="friendlyErrorMessage"
    @error="isMenuOpen = false">

    <q-menu fit v-model="isMenuOpen" v-if="menuHasObjects" no-focus :max-width="searchInputWidth">
      <q-list separator>
        <template v-for="statement in options" :key="statement.id">
          <q-item clickable @click="emit('select', statement)">
            <SideStats side class="text-caption justify-center"
              :supporting_arguments_count="statement?.supporting_arguments_count || 0"
              :opposing_arguments_count="statement?.opposing_arguments_count || 0"
              :comments_count="statement?.comments_count || 0" />
            <q-item-section>
              <q-item-label :lines="3">
                {{ statement.statement_text }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-if="sanitizeQuery(searchInput).length > 0">
          <q-item style="padding-left: 54px;" clickable @click="handleCreateNewStatement">
            <q-item-section>
              <q-item-label class="text-weight-bold">
                Create new statement:
              </q-item-label>
              <q-item-label :lines="3" class="text-wrap" style="min-width: 0; word-break: break-word;">
                {{ sanitizeQuery(searchInput) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-input>

</template>