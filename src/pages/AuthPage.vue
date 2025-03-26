<script setup lang="ts">
import { ref } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import { supabase } from '../utils/supabase';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const otpSent = ref(false);

const handleGoogleSignIn = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (authError) throw authError;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to sign in';
  } finally {
    loading.value = false;
  }
};

const handleEmailSignIn = async () => {
  if (!email.value || !password.value) return;

  loading.value = true;
  error.value = null;
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });
    if (authError) throw authError;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to sign in';
  } finally {
    loading.value = false;
  }
};

const handleOTPSignIn = async () => {
  if (!email.value) return;

  loading.value = true;
  error.value = null;
  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    if (authError) throw authError;
    otpSent.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to send magic link';
  } finally {
    loading.value = false;
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
