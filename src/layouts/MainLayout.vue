<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { debounce } from 'lodash';

const router = useRouter();
const searchTerm = ref('');
const authStore = useAuthStore();
const loadingUser = ref(false);

const userProfileLabel = computed(() =>
  authStore.userProfile?.username || 'Profile'
);

onMounted(async () => {
  if (authStore.user && !authStore.userProfile) {
    loadingUser.value = true;
    try {
      await authStore.fetchProfile(authStore.user.id);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      loadingUser.value = false;
    }
  }
});

const handleSearch = async () => {

  if (searchTerm.value.trim()) {
    console.log('handleSearch', searchTerm.value);
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

const debouncedSearch = debounce(handleSearch, 500);
</script>
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
          <q-route-tab v-else-if="!authStore.user?.id" to="/auth" label="Login/Register" />
          <q-route-tab v-else to="/user" :label="userProfileLabel" />
        </q-tabs>
      </q-toolbar>

      <q-toolbar>
        <q-space />
        <q-input style="max-width: 600px; width: 80%" v-model="searchTerm" type="search" placeholder="Search"
          class="q-px-md q-ma-md" @update:model-value="debouncedSearch" dense outlined bg-color="white">
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