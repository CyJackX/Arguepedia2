<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, watch, computed } from 'vue';
import ArgumentTab from '../components/ArgumentTab.vue';
import CommentTab from '../components/CommentTab.vue'
import UsernameButton from '../components/UsernameButton.vue'
import { useSupabase } from '../composables/useSupabase';
import type { Statement } from '../types/models';
import { useStatementStore } from '../stores/statementStore';
const route = useRoute();
const statementStore = useStatementStore();
const statementId = computed(() => parseInt(route.params.id as string));
const router = useRouter();
const currentStatement = ref<Statement | null>(null);
const isLoading = ref(false);
const activeTab = ref(route.query.tab?.toString() || 'comments');

const loadStatement = async () => {
  try {
    isLoading.value = true;
    console.log('Fetching statement:', statementId.value);
    const supabase = useSupabase();
    currentStatement.value = await supabase.fetchStatement(statementId.value);
  } catch (error) {
    console.error('Failed to fetch statement:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(statementId, async (newId) => {
  if (statementStore.currentStatement?.id === newId) {
    return; // Already have the correct statement loaded
  }
  await loadStatement();
}, { immediate: true }); // This handles the initial load too

watch(activeTab, async (newTab) => {
  await router.replace({ query: { ...route.query, tab: newTab } });
});
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5">{{ currentStatement?.statement_text }}</div>
          <div class="text-subtitle2">
            Created by
            <UsernameButton :username="currentStatement?.username as string" /> on
            {{ new Date(currentStatement?.created_at as string).toLocaleDateString() }}
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
          <ArgumentTab :statementId="statementId" type="OPPOSES" />
        </q-tab-panel>

        <q-tab-panel name="comments">
          <CommentTab :parent_id="currentStatement?.id as number" :parent_type="'statement'" />
        </q-tab-panel>

        <q-tab-panel name="supporting">
          <ArgumentTab :statementId="statementId" type="SUPPORTS" />
        </q-tab-panel>


      </q-tab-panels>
    </div>
  </div>
</template>
