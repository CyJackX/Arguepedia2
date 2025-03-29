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
  <q-list>
    <div class="q-pa-md">
      <h6>User Settings</h6>

      <q-card>
        <q-card-section>
          <h2>Reset Password</h2>
        </q-card-section>
        <q-card-section>
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
        </q-card-section>
      </q-card>

      <q-btn @click="authStore.signOut" class="q-mt-md">Sign out</q-btn>
    </div>
  </q-list>
</template>
