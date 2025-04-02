<script setup lang="ts">
import type { Comment } from '../types/models';
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
  toggleReplying,
  loadMoreComments,
  direct_comments_count,
  countDirectReplies,
} = useCommentReplies();

const hasReplies = computed(() => comments.value.length > 0);
const expandedIcon = computed(() => (expanded.value ? '⊖' : '⊕'));

onMounted(async () => {
  if (comments.value.length > 0) return;
  comments.value = await fetchComments(props.comment.id, 'comment');
  direct_comments_count.value = await countDirectReplies(props.comment.id, 'comment');
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
  <q-list id="comment-list" dense class="q-pl-md" :class="{ expanded: expanded }">
    <CommentComponent v-for="reply in comments" :key="reply.id" :comment="reply" />
    <q-btn class="q-ml-lg text-caption" style="font-style: italic" no-caps flat dense
      v-if="comments.length < direct_comments_count" label="...Load More"
      @click="loadMoreComments(comment.id, 'comment')" />
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

#comment-list {
  display: none;
}

#comment-list.expanded {
  display: block;
}
</style>
