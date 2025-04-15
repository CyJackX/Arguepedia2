<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter, useRoute } from 'vue-router';
import { Notify } from 'quasar';
import type { Session } from '@supabase/supabase-js';

const email = ref('');
const password = ref('');
const otpSent = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Expose loading and error from the store
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Set up auth state change listener
const { data: { subscription } } = authStore.onAuthStateChange((event, session: Session | null) => {
  if (event === 'SIGNED_IN' && session?.user) {
    Notify.create({
      type: 'positive',
      message: 'Successfully signed in!',
      position: 'top',
      timeout: 2000
    });

    // Get the redirect path from query params, stored path, or default to home
    const redirectPath = route.query.redirect?.toString() || authStore.getRedirectPath();
    void router.push(redirectPath);
  }
});

// Clean up listener when component is unmounted
onUnmounted(() => {
  subscription.unsubscribe();
});

const handleGoogleSignIn = () => {
  void authStore.signInWithGoogle();
};

const handleEmailSignIn = async () => {
  if (!email.value || !password.value) return;
  try {
    await authStore.signInWithPassword(email.value, password.value);
  } catch (e) {
    // Error is already handled by the store
    console.error('Sign in failed:', e);
  }
};

const handleOTPSignIn = async () => {
  if (!email.value) return;
  try {
    await authStore.signInWithOTP(email.value);
    otpSent.value = true;
  } catch (e) {
    // Error is already handled by the store
    console.error('OTP sign in failed:', e);
  }
};
</script>

<template>
  <div class="auth-page q-pa-md">
    <div class="auth-card q-pa-lg">
      <div class="text-h5 text-center q-mb-lg">Sign In</div>

      <!-- Google Sign In -->
      <q-btn unelevated color="primary" class="full-width q-mb-md" icon="img:https://www.google.com/favicon.ico"
        label="Continue with Google" :loading="loading" @click="handleGoogleSignIn" />

      <div class="text-center q-my-md text-grey">or</div>

      <template v-if="!otpSent">
        <q-form @submit.prevent="handleOTPSignIn">
          <q-input v-model="email" type="email" label="Email" outlined class="q-mb-md" :disable="loading" />

          <q-btn unelevated color="primary" class="full-width" label="Send Magic Link" type="submit"
            :loading="loading" />
        </q-form>

        <div class="text-center q-my-md text-grey">or</div>

        <q-form @submit.prevent="handleEmailSignIn">
          <q-input v-model="password" type="password" label="Password" outlined class="q-mb-md" :disable="loading" />

          <q-btn unelevated color="primary" class="full-width" label="Sign In with Password" type="submit"
            :loading="loading" />
        </q-form>
      </template>

      <template v-else>
        <div class="text-center">
          <q-icon name="check_circle" color="positive" size="48px" />
          <p class="text-h6 q-mt-md">Check your email</p>
          <p class="q-mb-lg">We've sent you a magic link to sign in</p>
          <q-btn flat color="primary" label="Send another link" @click="otpSent = false" />
        </div>
      </template>

      <!-- Error Display -->
      <q-banner v-if="error" class="bg-negative text-white q-mt-md" dense rounded>
        {{ error }}
      </q-banner>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f5f5f5;
  padding-top: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
