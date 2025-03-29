<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
  username: string;
}>()

const navigateToUser = async () => {
  await router.push(`/profile/${props.username}`);
}
</script>

<template>
  <span id="username" style="cursor: pointer" @click="navigateToUser">{{
    username
    }}</span>
</template>

<style scoped>
#username:hover {
  text-decoration: underline;
}
</style>