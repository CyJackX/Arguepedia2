<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useStatementCreation } from '../composables/useStatementCreation';

const { searchTerm } = inject('search') as {
  searchTerm: Ref<string>,
  searchTrigger: Ref<number>
};

const router = useRouter();
const authStore = useAuthStore();
const { sanitizeQuery, createNewStatement, errorMessage, friendlyErrorMessage } = useStatementCreation();

const handleCreateNewStatement = async () => {
  const new_statement = await createNewStatement(searchTerm.value);
  if (new_statement) {
    void router.push(`/statement/${new_statement.id}`);
  }
}
</script>
<template>
  <template v-if="authStore.user">
    <q-item class="column items-center">
      <q-item-section>
        <h6 class="q-my-none">Create New Statement</h6>
      </q-item-section>
      <q-item-section>
        <q-card>
          <q-card-section>
            <div class="text-weight-bold">
              {{ sanitizeQuery(searchTerm) }}
            </div>
          </q-card-section>
        </q-card>
      </q-item-section>
      <q-item-section>
        <q-card-section v-if="errorMessage">
          <div class="text-negative">{{ friendlyErrorMessage }}</div>
        </q-card-section>
      </q-item-section>
      <q-item-section>
        <q-card-actions>
          <q-btn label="Create Statement" color="primary" @click="handleCreateNewStatement" />
        </q-card-actions>
      </q-item-section>
    </q-item>
  </template>
  <template v-else>
    <q-item>
      <q-item-section>
        <h6 class="q-my-none">Login to Create New Statement</h6>
      </q-item-section>
    </q-item>
  </template>
</template>
