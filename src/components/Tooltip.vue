<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  data: Record<string, any>;  // Accept any object with string keys and any values
  excludeFields?: string[];   // Optional array of fields to exclude
}>();

const isVisible = ref(false);
</script>

<template>
  <span 
    class="tooltip-trigger"
    @mouseover="isVisible = true"
    @mouseleave="isVisible = false">
    🛈
    <div v-if="isVisible" class="tooltip">
      <template v-for="[key, value] in Object.entries(data)" :key="key">
        <div v-if="!excludeFields?.includes(key)" class="tooltip-row">
          <span>{{ key.split('_').join(' ').replace(/\b\w/g, c => c.toUpperCase()) }}:</span>
          <span>{{ value }}</span>
        </div>
      </template>
      <slot></slot>
    </div>
  </span>
</template>

<style scoped>
.tooltip-trigger {
  position: relative;
  cursor: help;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  width: max-content;
  z-index: 10;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
}
</style> 