<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useStatementStore } from '../stores/statementStore';
import { ref, onMounted, computed } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import type { Comment } from '../components/models';
import CommentComponent from '../components/CommentComponent.vue';

const route = useRoute();
const statementId = route.params.id;
const statementStore = useStatementStore();
const supabase = useSupabase();
const isLoading = ref(true);
const activeTab = ref('comments');
const currentStatement = computed(() => statementStore.currentStatement);

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

const comments = ref<Comment[]>([]);

onMounted(async () => {
  void loadStatement();
  comments.value = await supabase.fetchComments(parseInt(statementId as string), 'statement');
});
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <q-card>
        <q-card-section>
          {{ statementStore.currentStatement?.statement_text }}
        </q-card-section>
        <q-card-section>
          Created by {{ statementStore.currentStatement?.username }} on
          {{ new Date(statementStore.currentStatement?.created_at as string).toLocaleString() }}
        </q-card-section>
      </q-card>
      <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary"
        align="justify">
        <q-tab name="opposing" icon="close" label="Opposing" />
        <q-tab name="comments" icon="comment" label="Comments" />
        <q-tab name="supporting" icon="check" label="Supporting" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="comments">
          <h3>Comments</h3>
          <div v-if="currentStatement?.comments_count && currentStatement.comments_count === 0">
            No Comments
          </div>
          <q-list v-else>
            <CommentComponent v-for="comment in comments" :key="comment.id" :comment="comment" />
          </q-list>
        </q-tab-panel>
        <q-tab-panel name="arguments">
          <div v-if="currentStatement?.supporting_arguments_count && currentStatement.supporting_arguments_count > 0">
            <h3>Supporting Arguments</h3>
          </div>
        </q-tab-panel>
        <q-tab-panel name="opposing">
          <h3>Opposing Arguments</h3>
          <div v-if="currentStatement?.opposing_arguments_count && currentStatement.opposing_arguments_count > 0">

          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>
