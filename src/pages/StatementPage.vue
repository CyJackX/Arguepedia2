<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, watch, computed } from 'vue';
import ArgumentTab from '../components/ArgumentTab.vue';
import CommentTab from '../components/CommentTab.vue'
import UsernameButton from '../components/UsernameButton.vue'
import { useStatementStore } from '../stores/statementStore';

const route = useRoute();
const router = useRouter();
const statementStore = useStatementStore();

// Keep this for route watching only
const statementId = computed(() => parseInt(route.params.id as string));
const activeTab = ref(route.query.tab?.toString() || 'comments');

watch(statementId, async (newId) => {
  if (statementStore.currentStatement?.id === newId) {
    return; // Already have the correct statement loaded
  }
  await statementStore.fetchStatement(newId);
}, { immediate: true });

watch(activeTab, async (newTab) => {
  await router.replace({ query: { ...route.query, tab: newTab } });
});
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

      <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary"
        align="justify">
        <q-tab name="opposing" icon="close" label="Opposing Arguments" />
        <q-tab name="comments" icon="comment" label="Comments" />
        <q-tab name="supporting" icon="check" label="Supporting Arguments" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="opposing">
          <ArgumentTab :statementId="statementStore.currentStatement?.id as number" type="OPPOSES" />
        </q-tab-panel>

        <q-tab-panel name="comments">
          <CommentTab :parent_id="statementStore.currentStatement?.id as number" :parent_type="'statement'" />
        </q-tab-panel>

        <q-tab-panel name="supporting">
          <ArgumentTab :statementId="statementStore.currentStatement?.id as number" type="SUPPORTS" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>
