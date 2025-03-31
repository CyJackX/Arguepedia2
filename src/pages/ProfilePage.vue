<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Statement, Argument, Comment, Profile } from '../types/models';
import StatementComponent from '../components/StatementComponent.vue';
import ArgumentComponent from '../components/ArgumentComponent.vue';
import CommentComponent from '../components/CommentComponent.vue';
import { useSupabase } from '../composables/useSupabase';

const route = useRoute();
const router = useRouter();
const username = ref(route.params.username as string);
const userProfile = ref<Profile | null>(null);
const statements = ref<Statement[]>([]);
const argumentsList = ref<Argument[]>([]);
const comments = ref<Comment[]>([]);
const isLoading = ref(true);
const tab = ref('statements');
const supabase = useSupabase();

onMounted(async () => {
  try {
    // First fetch the user profile to get the user_id
    const profileData = await supabase.fetchUserProfile(username.value);
    userProfile.value = profileData;

    // Fetch all user activity
    await supabase.fetchUserActivity(profileData.user_id);

    // Update local refs with the data from useSupabase
    statements.value = supabase.userStatements.value;
    argumentsList.value = supabase.userArguments.value;
    comments.value = supabase.userComments.value;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    await router.push('/404');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="q-pa-md">
    <h5 class="q-my-none">{{ username }}'s Profile</h5>

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
            :bottomStats="true" />
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
