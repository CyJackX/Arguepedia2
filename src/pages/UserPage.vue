<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSupabase } from 'src/composables/useSupabase';

const auth = useSupabase();
const route = useRoute();
</script>

<template>
  <div>
    <h1>User {{ auth.userProfile.value?.username }}</h1>
  </div>
</template>
