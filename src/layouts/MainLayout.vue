<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title align="center">
          Arguepedia
        </q-toolbar-title>
      </q-toolbar>

      <q-toolbar>
        <q-tabs align="center" class="full-width">
          <q-route-tab to="/" label="Front Page" />
          <q-route-tab to="/about" label="About" />
          <q-route-tab v-if="loadingUser" label="Loading..." />
          <q-route-tab v-else-if="!auth.user?.value?.id" to="/auth" label="Login/Register" />
          <q-route-tab v-else :to="userProfilePath" :label="loadingUser ? 'Loading...' : userProfileLabel" />
        </q-tabs>
      </q-toolbar>

      <q-toolbar>
        <q-space />
        <q-input style="max-width: 600px; width: 80%" v-model="searchTerm" type="search" placeholder="Search"
          class="q-px-md q-ma-md" @keyup.enter="handleSearch" dense outlined bg-color="white">
          <template v-slot:append>
            <q-icon name="search" @click="handleSearch" />
          </template>
        </q-input>
        <q-space />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex justify-center">
        <div class="q-pa-md" style="max-width: 600px; width: 100%">
          <router-view />
        </div>
      </q-page>
    </q-page-container>

    <q-footer class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title align="center">
          <div>Copyright Andy Zou 2025</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabase } from 'src/composables/useSupabase';

const router = useRouter();
const searchTerm = ref('');
const auth = useSupabase();
const loadingUser = ref(false);

// Computed properties to handle null checks
const userProfilePath = computed(() => {
  if (auth.userProfile.value) {
    return `/user/${auth.userProfile.value.username}`
  } else if (auth.user.value) {
    return `/user/${auth.user.value.id}`
  } else {
    return '/user/profile'
  }
});

const userProfileLabel = computed(() => {
  if (auth.userProfile.value) {
    return auth.userProfile.value.username
  } else if (auth.user.value) {
    return auth.user.value.id
  } else {
    return 'Profile'
  }
});

onMounted(async () => {
  if (auth.user.value && !auth.userProfile.value) {
    loadingUser.value = true;
    try {
      await auth.fetchProfile(auth.user.value.id);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Optionally show an error notification to the user
    } finally {
      loadingUser.value = false;
    }
  }
});

const handleSearch = async () => {
  if (searchTerm.value.trim()) {
    try {
      await router.push({
        path: '/search',
        query: { q: searchTerm.value }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Handle navigation failure if needed
    }
  }
};
</script>
