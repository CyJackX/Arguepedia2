<script setup lang="ts">
import { useRoute } from 'vue-router';
import { watch, computed } from 'vue';
import UsernameButton from '../components/UsernameButton.vue'
import { useStatementStore } from '../stores/statementStore';

const route = useRoute();
const statementStore = useStatementStore();

// Keep this for route watching only
const statementId = computed(() => parseInt(route.params.id as string));

watch(statementId, async (newId) => {
  if (statementStore.currentStatement?.id === newId) {
    return; // Already have the correct statement loaded
  }
  await statementStore.fetchStatement(newId);
}, { immediate: true });

</script>

<template>
  <div>
    <div v-if="statementStore.isLoading">Loading...</div>
    <div v-else>
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5">{{ statementStore.currentStatement?.statement_text }}</div>
          <div class="text-subtitle2">
            Created by
            <UsernameButton :username="statementStore.currentStatement?.username as string" /> on
            {{ new Date(statementStore.currentStatement?.created_at as string).toLocaleDateString() }}
          </div>
        </q-card-section>
      </q-card>

      <!-- QTabs without v-model, using QRouteTab for route-driven tabs -->
      <q-tabs dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
        <q-route-tab name="opposing" :to="{ name: 'opposing', params: { id: statementStore.currentStatement?.id } }"
          icon="close"
          :label="`Opposing Arguments (${statementStore.currentStatement?.opposing_arguments_count || 0})`" />
        <q-route-tab name="comments" :to="{ name: 'comments', params: { id: statementStore.currentStatement?.id } }"
          icon="comment" :label="`Comments (${statementStore.currentStatement?.comments_count || 0})`" />
        <q-route-tab name="supporting" :to="{ name: 'supporting', params: { id: statementStore.currentStatement?.id } }"
          icon="check"
          :label="`Supporting Arguments (${statementStore.currentStatement?.supporting_arguments_count || 0})`" />
      </q-tabs>

      <q-separator />

      <!-- Router-view renders the active tab content -->
      <router-view />
    </div>
  </div>
</template>
