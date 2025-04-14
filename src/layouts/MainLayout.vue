<script setup lang="ts">
import { ref, onMounted, provide, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { debounce } from 'lodash';

const router = useRouter();
const route = useRoute();
const searchTerm = ref(route.query.q as string);
const searchTrigger = ref(0);
const authStore = useAuthStore();
const loadingUser = ref(false);


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
      searchTrigger.value++;
    } catch (error) {
      console.error('Navigation error:', error);
      // Handle navigation failure if needed
    }
  }
};

const debouncedSearch = debounce(handleSearch, 500);

watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string') {
      searchTerm.value = newQuery;
    }
  }
);

provide('search', {
  searchTerm,
  searchTrigger
});

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
          <q-route-tab v-else to="/user" label="Settings" />
        </q-tabs>
      </q-toolbar>

      <q-toolbar>
        <q-space />
        <q-input v-model="searchTerm" type="search" placeholder="Search statements or create your own..."
          class="q-px-md q-ma-md" @update:model-value="debouncedSearch" @keyup.enter="handleSearch" dense outlined
          bg-color="white" maxlength="140" counter style="width:600px ;max-width: 80%">
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

    <!-- <q-footer reveal class="bg-grey-8 text-white text-caption text-center">
      Copyright Andy Zou 2025
    </q-footer> -->

  </q-layout>
</template>
