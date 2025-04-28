<template>
  <div class="text-center q-pa-md">
    <!-- Hello World Section -->
    <div class="q-mb-xl">
      <q-btn @click="loadHelloMessage">Load Hello Message</q-btn>
      <q-card class="q-pa-md">
        <div v-if="helloLoading">
          <q-spinner-dots class="q-mx-auto text-center text-h4" />
        </div>
        <div v-else>
          <h2 class="text-h5">{{ helloMessage }}</h2>
          <p class="text-caption">Server time: {{ helloTimestamp }}</p>
        </div>
      </q-card>
    </div>

    <h1 class="text-h3 q-mb-md"></h1>
    <p class="text-body1 q-mx-auto" style="max-width: 600px">
      Arguepedia is a platform for creating and sharing arguments.
    </p>
  </div>
  <h2 class="text-h4 q-mb-md text-center">Recent Arguments</h2>
  <q-card v-if="isLoading">
    <q-card-section align="center">
      <q-spinner-dots class="q-mx-auto text-center text-h4" />
    </q-card-section>
  </q-card>
  <q-list v-else>
    <ArgumentComponent startExpanded class="q-mb-md" v-for="argument in recentArguments" :key="argument.id"
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
const helloLoading = ref(true);
const helloMessage = ref('');
const helloTimestamp = ref('');

const loadHelloMessage = async () => {
  try {
    const response = await fetch('/api/hello', {
      headers: {
        'timestamp': new Date().toISOString()
      }
    });
    const data = await response.json();
    helloMessage.value = data.message;
    console.log('helloMessage', helloMessage.value);
    helloTimestamp.value = new Date(data.timestamp).toLocaleString();
  } catch (error) {
    console.error('Error loading hello message:', error);
    helloMessage.value = (error as Error).message;
    helloLoading.value = false;
  } finally {
    helloLoading.value = false;
  }
};

const loadRecentArguments = async () => {
  try {
    console.log('Loading recent arguments');
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
