<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useStatementStore } from '../stores/statementStore';
import { ref, onMounted, computed, watch } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import type { Argument } from '../components/models';
import ArgumentComponent from '../components/ArgumentComponent.vue';
import CommentTab from '../components/CommentTab.vue'

const route = useRoute();
const statementId = route.params.id;
const statementStore = useStatementStore();
const supabase = useSupabase();
const isLoading = ref(true);
const activeTab = ref(route.query.tab?.toString() || 'comments');
const opposingArguments = ref<Argument[]>([]);
const supportingArguments = ref<Argument[]>([]);
const router = useRouter();

const loadStatement = async () => {
  if (!statementStore.currentStatement) {
    try {
      console.log('Fetching statement:', statementId);
      await statementStore.fetchStatement(parseInt(statementId as string));
    } catch (error) {
      console.error('Failed to fetch statement:', error);
    }
  }
  isLoading.value = false;
};


onMounted(async () => {
  void loadStatement();
  supportingArguments.value = await supabase.fetchArguments_by_conclusion(parseInt(statementId as string), 'SUPPORTS');
  opposingArguments.value = await supabase.fetchArguments_by_conclusion(parseInt(statementId as string), 'OPPOSES');
});

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
          <div class="text-h4">{{ statementStore.currentStatement?.statement_text }}</div>
          <div class="text-subtitle2">
            Created by {{ statementStore.currentStatement?.username }} on
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

        <q-tab-panel name="comments">
          <CommentTab :parent_id="statementStore.currentStatement?.id as number" :parent_type="'statement'" />
        </q-tab-panel>

        <q-tab-panel name="supporting">
          <div
            v-if="statementStore.currentStatement?.supporting_arguments_count && statementStore.currentStatement.supporting_arguments_count > 0">
            <ArgumentComponent v-for="argument in supportingArguments" :key="argument.id" :argument="argument" />
          </div>
          <div v-else>No Supporting Arguments! Make one?</div>
        </q-tab-panel>

        <q-tab-panel name="opposing">
          <div
            v-if="statementStore.currentStatement?.opposing_arguments_count && statementStore.currentStatement.opposing_arguments_count > 0">
            <ArgumentComponent v-for="argument in opposingArguments" :key="argument.id" :argument="argument" />
          </div>
          <div v-else>No Opposing Arguments! Make one?</div>
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </div>
</template>
