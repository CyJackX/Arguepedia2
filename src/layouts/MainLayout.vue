<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-primary text-white " height-hint="98">
      <q-toolbar>
        <q-toolbar-title align="center">
          Arguepedia
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="center">
        <q-route-tab to="/" label="Home" />
        <q-route-tab to="/about" label="About" />

        <q-route-tab to="/page3" label="Page Three" />
      </q-tabs>
      <q-input v-model="searchTerm" type="search" placeholder="Search" class="q-px-md q-ma-sm col-2"
        @keyup.enter="handleSearch" maxlength="140" dense outlined bg-color="white" :rules="[
          val => /^[a-zA-Z0-9.,!?#$%& ]*$/.test(val) || 'Only letters, numbers, and basic punctuation allowed'
        ]" counter>
        <template v-slot:append>
          <q-icon name="search" @click="handleSearch" />
        </template>
      </q-input>
    </q-header>

    <q-page-container>
      <router-view />
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
