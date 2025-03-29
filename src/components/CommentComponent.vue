<script setup lang="ts">
import type { Comment } from './models';
import { computed, onMounted } from 'vue';
import { useCommentReplies } from '../composables/useComments';
import { format } from 'timeago.js';
import ReplyBox from './ReplyBox.vue';
import UsernameButton from './UsernameButton.vue';

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
        <span id="comment-count" v-if="hasReplies" @click="toggleExpanded" style="cursor: pointer" class="q-mr-xs">
          {{ expandedIcon }}
          {{ comment.comments_count }}
          <q-icon name="chat" />
        </span>
        <span id="reply-button" @click="toggleReplying" style="cursor: pointer">Reply</span> to
        <UsernameButton :username="comment.username" />
        •{{ format(comment.created_at) }}
      </q-item-label>
    </q-item-section>
  </q-item>
  <q-item v-if="replying">
    <q-item-section class="q-pl-md">
      <ReplyBox :parent-id="comment.id" :parent-type="'comment'" @reply="(comment: Comment) => {
        comments.unshift(comment);
        expanded = true;
      }" />
    </q-item-section>
  </q-item>
  <q-list dense class="q-pl-md" v-if="expanded">
    <CommentComponent v-for="reply in comments" :key="reply.id" :comment="reply" />
  </q-list>
</template>

<style scoped>
q-item-section {
  border-left: 1px solid #ccc;
}

#comment-count:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

#reply-button:hover {
  text-decoration: underline;
}
</style>
