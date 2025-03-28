<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore';
import { ref } from 'vue';

const authStore = useAuthStore();
const newPassword = ref('');
const confirmPassword = ref('');
const resetError = ref<string | null>(null);
const resetSuccess = ref(false);

async function handlePasswordReset() {
  if (newPassword.value !== confirmPassword.value) {
    resetError.value = 'Passwords do not match';
    return;
  }

  try {
    await authStore.updatePassword(newPassword.value);
    resetSuccess.value = true;
    resetError.value = null;
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    resetError.value = error instanceof Error ? error.message : 'Failed to reset password';
  }
}
</script>

<template>
  <div class="q-pa-md">
    <h1>User {{ authStore.userProfile?.username }}</h1>

    <div class="q-mt-md">
      <h2>Reset Password</h2>
      <q-form @submit.prevent="handlePasswordReset" class="q-gutter-md">
        <q-input v-model="newPassword" type="password" label="New Password"
          :rules="[val => !!val || 'Password is required']" />
        <q-input v-model="confirmPassword" type="password" label="Confirm Password"
          :rules="[val => !!val || 'Password is required']" />

        <div v-if="resetError" class="text-negative">
          {{ resetError }}
        </div>

        <div v-if="resetSuccess" class="text-positive">
          Password successfully updated!
        </div>

        <q-btn type="submit" color="primary" label="Update Password" />
      </q-form>
    </div>

    <q-btn @click="authStore.signOut" class="q-mt-md">Sign out</q-btn>
  </div>
</template>
