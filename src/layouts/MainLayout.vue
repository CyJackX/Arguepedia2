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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchTerm = ref('');

const handleSearch = () => {
  if (searchTerm.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchTerm.value }
    });
  }
};
</script>
