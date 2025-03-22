<template>
  <header class="w-full flex flex-row justify-between items-center">
    <h1 class="text-2xl font-bold p-4">Arguepedia</h1>
    <div class="flex-row justify-end">
      <Auth v-if="!user" />
      <div v-else class="flex items-center gap-4">
        <span>{{ user.email }}</span>
        <button 
          @click="handleSignOut" 
          class="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'
import Auth from './Auth.vue'

const user = ref<User | null>(null)

onMounted(() => {
  // Get initial user state
  user.value = supabase.auth.getUser()

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
})

async function handleSignOut() {
  await supabase.auth.signOut()
}
</script>