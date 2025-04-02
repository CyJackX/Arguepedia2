<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import ArgumentComponent from '../components/ArgumentComponent.vue';
import CommentTab from '../components/CommentTab.vue';
import { useSupabase } from '../composables/useSupabase';
import type { Argument } from '../types/models';

const route = useRoute();
const argumentId = computed(() => parseInt(route.params.id as string));
const currentArgument = ref<Argument | null>(null);
const isLoading = ref(true);
const supabase = useSupabase();

const loadArgument = async () => {
  currentArgument.value = await supabase.fetchArgumentbyId(argumentId.value);
  isLoading.value = false;
};

onMounted(async () => {
  await loadArgument();
});
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <ArgumentComponent :argument="currentArgument as Argument" />
      <CommentTab :parent_id="currentArgument?.id as number" :parent_type="'argument'" />
    </div>
  </div>
</template>
