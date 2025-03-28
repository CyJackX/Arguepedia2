<template>
  <q-input dense rounded outlined maxlength="500" autogrow placeholder="Comment..." v-model="reply">
    <template v-slot:append>
      <q-btn round dense flat icon="send" @click="sendReply(props.parentId, props.parentType)" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { useCommentReplies } from '../composables/useComments';
import { ref } from 'vue';
import type { TopicType } from '../components/models';
const props = defineProps<{
  parentId: number;
  parentType: TopicType;
}>();

const reply = ref('');

const { sendReply } = useCommentReplies();
</script>
