<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Statement, Argument, Comment, Profile } from '../components/models';
import StatementComponent from '../components/StatementComponent.vue';
import ArgumentComponent from '../components/ArgumentComponent.vue';
import CommentComponent from '../components/CommentComponent.vue';
import { supabase } from '../utils/supabase';

const route = useRoute();
const router = useRouter();
const username = ref(route.params.username as string);
const userProfile = ref<Profile | null>(null);
const statements = ref<Statement[]>([]);
const argumentsList = ref<Argument[]>([]);
const comments = ref<Comment[]>([]);
const isLoading = ref(true);
const tab = ref('statements');

onMounted(async () => {
  try {
    // First fetch the user profile to get the user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('username', username.value)
      .single();

    if (profileError || !profileData) {
      console.error('User not found');
      await router.push('/404');
      return;
    }

    userProfile.value = profileData;

    // Fetch all user activity in parallel
    const [statementsResponse, argumentsResponse, commentsResponse] = await Promise.all([
      supabase
        .from('statements')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false }),

      supabase
        .from('arguments')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false }),

      supabase
        .from('comments')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false })
    ]);

    statements.value = statementsResponse.data || [];
    argumentsList.value = argumentsResponse.data || [];
    comments.value = commentsResponse.data || [];

  } catch (error) {
    console.error('Error fetching user activity:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="q-pa-md">
    <h1 class="q-my-none">{{ username }}'s Profile</h1>

    <q-tabs v-model="tab" class="text-primary">
      <q-tab name="statements" label="Statements" />
      <q-tab name="arguments" label="Arguments" />
      <q-tab name="comments" label="Comments" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="statements">
        <div v-if="isLoading">Loading statements...</div>
        <q-list v-else-if="statements.length > 0" separator>
          <StatementComponent v-for="statement in statements" :key="statement.id" :statement="statement"
            :show-stats="true" />
        </q-list>
        <div v-else>No statements yet</div>
      </q-tab-panel>

      <q-tab-panel name="arguments">
        <div v-if="isLoading">Loading arguments...</div>
        <div v-else-if="argumentsList.length > 0" class="q-gutter-md">
          <ArgumentComponent v-for="argument in argumentsList" :key="argument.id" :argument="argument" />
        </div>
        <div v-else>No arguments yet</div>
      </q-tab-panel>

      <q-tab-panel name="comments">
        <div v-if="isLoading">Loading comments...</div>
        <q-list v-else-if="comments.length > 0" separator>
          <CommentComponent v-for="comment in comments" :key="comment.id" :comment="comment" />
        </q-list>
        <div v-else>No comments yet</div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
