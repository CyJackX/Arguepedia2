<script setup lang="ts">

const props = defineProps({
  statementId: {
    type: Number,
    required: false,
    default: null
  },
  statementText: {
    type: String,
    required: false,
    default: null
  }
})
</script>

<template>
  <div
    class="flex items-center justify-center card border border-gray-300 shadow-lg rounded-lg px-4 py-2 text-justify hyphens-auto relative">
    <div class="w-full">
      <!-- Main content -->
      <template v-if="!statementText">
        <slot></slot>
      </template>
      <template v-else>
        <p>{{ statementText }}</p>

      </template>

      <!-- Bottom slot for additional content -->
      <div class="text-sm text-gray-400">
        <slot name="bottom"></slot>

      </div>
    </div>
  </div>
</template>
