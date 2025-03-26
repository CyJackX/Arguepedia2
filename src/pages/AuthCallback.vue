<template>
  <div class="flex flex-center">
    <q-spinner-dots size="40px" />
    <p>Logging you in...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.getUser();
    await router.push('/');
  } catch (error) {
    console.error('Error in auth callback:', error);
    await router.push('/auth');
  }
});
</script>