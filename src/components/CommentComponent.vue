<script setup lang="ts">
import type { Comment } from './models';
import { computed, onMounted } from 'vue';
import { useCommentReplies } from '../composables/useComments';
import { format } from 'timeago.js';
import ReplyBox from './ReplyBox.vue';
const props = defineProps<{
  comment: Comment;
}>();

const {
  comments,
  replying,
  expanded,
  fetchComments,
  toggleExpanded,
  toggleReplying
} = useCommentReplies();

const hasReplies = computed(() => comments.value.length > 0);
const expandedIcon = computed(() => (expanded.value ? '⊖' : '⊕'));

onMounted(async () => {
  comments.value = await fetchComments(props.comment.id, 'comment');
});
</script>

<template>
  <q-item>
    <q-item-section class="q-pa-xs">
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
  <q-item v-if="replying">
    <q-item-section class="q-pl-md">
      <ReplyBox :parent-id="comment.id" :parent-type="'comment'" />
    </q-item-section>
  </q-item>
  <q-list dense class="q-pl-md" v-if="expanded">
    <CommentComponent v-for="reply in comments" :key="reply.id" :comment="reply" />
  </q-list>
</template>

<style scoped></style>
