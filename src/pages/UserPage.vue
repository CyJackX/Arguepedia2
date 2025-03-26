<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore';

const authStore = useAuthStore();
</script>

<template>
  <div>
    <h1>User {{ authStore.userProfile?.username }}</h1>
  </div>
  <q-btn @click="authStore.signOut">Sign out</q-btn>
</template>
