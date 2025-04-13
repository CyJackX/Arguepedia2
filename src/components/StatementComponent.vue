<script setup lang="ts">
import type { Statement } from '../types/models';
import UsernameButton from './UsernameButton.vue';
import SideStats from './SideStats.vue';

const props = defineProps<{
  statement: Statement | null;
  bottomStats?: boolean;
  sideStats?: boolean;
  bold?: boolean;
}>()

// Disable attribute inheritance on root element if needed
defineOptions({
  inheritAttrs: false
});

</script>

<template>

  <q-item v-bind="$attrs">
    <SideStats side class="text-caption justify-center" v-if="sideStats"
      :supporting_arguments_count="statement?.supporting_arguments_count || 0"
      :opposing_arguments_count="statement?.opposing_arguments_count || 0"
      :comments_count="statement?.comments_count || 0" />

    <!-- Statement text -->
    <q-item-section>
      <template v-if="statement">
        <q-item-label :style="{ fontWeight: bold ? 'bold' : 'normal' }">{{
          props.statement?.statement_text }}
          <!-- <span id="statement-text" clickable @click="navigateToStatement"></span> -->
        </q-item-label>

        <!-- Bottom stats -->
        <q-item-label caption v-if="bottomStats">
          <q-icon color="green" name="check" /> {{ props.statement?.supporting_arguments_count || 0 }} | <q-icon
            color="red" name="close" />
          {{ props.statement?.opposing_arguments_count || 0 }} | <q-icon name="comment" /> {{
            props.statement?.comments_count || 0
          }}
          <br>Created by
          <UsernameButton :username="props.statement?.username as string" /> on {{ new
            Date(props.statement?.created_at
              ||
              '').toLocaleString() }}
        </q-item-label>
      </template>
      <slot v-else></slot>
    </q-item-section>

  </q-item>
</template>

<style scoped>
#statement-text {
  cursor: pointer;
}

/* .q-item__label+.q-item__label {
  margin: 0px !important;
} */
</style>