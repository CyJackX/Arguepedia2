<script setup lang="ts">
const props = defineProps<{
  supporting_arguments_count: number;
  opposing_arguments_count: number;
  comments_count: number;
}>();

// Disable attribute inheritance on root element if needed
defineOptions({
  inheritAttrs: false
});

</script>
<template>
  <q-item-section v-bind="$attrs">
    <q-item-label>
      <q-icon color="green" name="check" /> {{ props.supporting_arguments_count || 0 }}
    </q-item-label>
    <q-item-label>
      <q-icon color="red" name="close" /> {{ props.opposing_arguments_count || 0 }}
    </q-item-label>
    <q-item-label>
      <q-icon name="comment" /> {{ props.comments_count || 0 }}
    </q-item-label>
  </q-item-section>
</template>
