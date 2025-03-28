<script setup lang="ts">
import type { Comment } from './models';
import { computed, onMounted } from 'vue';
import { useCommentReplies } from '../composables/useComments';
import { format } from 'timeago.js';

const props = defineProps<{
  comment: Comment;
}>();

const {
  comments,
  replying,
  reply,
  expanded,
  fetchComments,
  toggleExpanded,
  toggleReplying,
  sendReply
} = useCommentReplies();

const hasReplies = computed(() => comments.value.length > 0);
const expandedIcon = computed(() => (expanded.value ? '⊖' : '⊕'));

onMounted(async () => {
  comments.value = await fetchComments(props.comment.id, 'comment');
});
</script>

<template>
  <q-item>
    <q-item-section>
      <q-item-label>{{ comment.content }}</q-item-label>
      <q-item-label caption>
        <span v-if="hasReplies" @click="toggleExpanded" style="cursor: pointer" class="q-mr-xs">{{
          expandedIcon
        }}</span>
        <span @click="toggleReplying" style="cursor: pointer">Reply</span> to <span style="cursor: pointer"
          @click="$router.push(`/user/${comment.username}`)">{{
            comment.username
          }}</span> •
        <span>{{ format(comment.created_at) }}</span>
      </q-item-label>
    </q-item-section>
  </q-item>

  <q-list dense class="q-pl-md">
    <q-item v-if="replying">
      <q-item-section>
        <q-input outlined v-model="reply" />
        <q-btn @click="sendReply(comment.id, 'comment')">Send</q-btn>
      </q-item-section>
    </q-item>
    <CommentComponent v-if="expanded" v-for="reply in comments" :key="reply.id" :comment="reply" />
  </q-list>
</template>

<style scoped></style>
