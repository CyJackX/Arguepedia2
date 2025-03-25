<script setup lang="ts">
import { ref } from 'vue';
import CommentComponent from './CommentComponent.vue';

interface Comment {
  id: number;
  content: string;
  author: string;
  replies: Comment[];
}

const comments = ref<Comment[]>([
  {
    id: 1,
    content: 'This is a sample comment',
    author: 'John Doe',
    replies: [],
  },
]);

const handleReply = (parentId: number, content: string) => {
  const addReply = (comments: Comment[], parentId: number, newReply: Comment): boolean => {
    for (const comment of comments) {
      if (comment.id === parentId) {
        comment.replies.push(newReply);
        return true;
      }
      if (comment.replies.length && addReply(comment.replies, parentId, newReply)) {
        return true;
      }
    }
    return false;
  };

  const newComment: Comment = {
    id: Date.now(), // Simple way to generate unique IDs
    content,
    author: 'Current User', // In a real app, this would come from auth state
    replies: [],
  };

  addReply(comments.value, parentId, newComment);
};
</script>

<template>
  <div class="comments-container">
    <CommentComponent v-for="comment in comments" :key="comment.id" :comment="comment" @reply="handleReply" />
  </div>
</template>

<style scoped>
.comments-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
</style>