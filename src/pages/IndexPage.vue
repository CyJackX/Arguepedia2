<template>
  <div class="text-center q-pa-md">
    <h1 class="text-h3 q-mb-md"></h1>
    <p class="text-body1 q-mx-auto" style="max-width: 600px">
      Arguepedia is a platform for creating and sharing arguments. It is a
      place for people to come together and argue about things they care about.
    </p>
  </div>
  <h2 class="text-h4 q-mb-md text-center">Recent Arguments</h2>

  <q-list>
    <q-inner-loading v-if="isLoading">
      <q-spinner-dots color="primary" size="40px" />
    </q-inner-loading>
    <ArgumentComponent v-else startExpanded class="q-mb-md" v-for="argument in recentArguments" :key="argument.id"
      :argument="argument" />
  </q-list>



</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../utils/supabase';
import ArgumentComponent from '../components/ArgumentComponent.vue';
import type { Argument } from '../types/models';


const recentArguments = ref<Argument[]>([]);
const isLoading = ref(true);

const loadRecentArguments = async () => {
  try {
    const { data, error } = await supabase
      .from('argument_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    recentArguments.value = data;
  } catch (error) {
    console.error('Error loading recent arguments:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  void loadRecentArguments();
});

</script>
