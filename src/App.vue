<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  console.log('[Client] App mounted');
  console.log('[Client] Hydration complete');
});
</script>
