<template>
  <q-input dense rounded outlined maxlength="500" autogrow placeholder="Comment..." v-model="reply">
    <template v-slot:append>
      <q-btn round dense flat icon="send" @click="handleReply()" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { useCommentReplies } from '../composables/useComments';
import type { TopicType, Comment } from '../types/models';

const props = defineProps<{
  parentId: number;
  parentType: TopicType;
}>();

const { sendReply, reply } = useCommentReplies();

const emit = defineEmits<{
  (e: 'reply', comment: Comment): void;
}>();

const handleReply = async () => {
  const newComment = await sendReply(props.parentId, props.parentType);
  if (newComment) {
    emit('reply', newComment);
  } else {
    console.error('Error sending reply');
  }
};

</script>
