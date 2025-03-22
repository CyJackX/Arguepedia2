<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from './supabase'

const email = ref('')
const loading = ref(false)
const error = ref(null)
const message = ref('')

async function handleSignIn() {
  try {
    loading.value = true
    error.value = null
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (signInError) throw signInError
    
    message.value = 'Check your email for the login link!'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <form @submit.prevent="handleSignIn" class="flex flex-col gap-4">
      <input
        v-model="email"
        type="email"
        placeholder="Your email"
        class="p-2 border rounded"
        required
      />
      <button 
        type="submit"
        class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        :disabled="loading"
      >
        {{ loading ? 'Sending...' : 'Sign In with Magic Link' }}
      </button>
      <p v-if="error" class="text-red-500">{{ error }}</p>
      <p v-if="message" class="text-green-500">{{ message }}</p>
    </form>
  </div>
</template>

