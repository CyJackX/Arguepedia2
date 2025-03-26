<template>
  <div class="flex flex-center">
    <q-spinner-dots size="40px" />
    <p>Logging you in...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from 'src/utils/supabase';

const router = useRouter();

onMounted(async () => {
  try {
    // Handle the OAuth callback
    const { error } = await supabase.auth.getSession();
    if (error) throw error;

    // Redirect to home page or dashboard after successful login
    await router.push('/');
  } catch (error) {
    console.error('Error in auth callback:', error);
    await router.push('/auth'); // Redirect back to auth page if there's an error
  }
});
</script>