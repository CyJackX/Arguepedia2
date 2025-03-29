<script setup lang="ts">
import { onMounted } from 'vue';
import type { TopicType, Comment } from './models';
import { useCommentReplies } from '../composables/useComments';
import ReplyBox from '../components/ReplyBox.vue';
import CommentComponent from '../components/CommentComponent.vue';

const props = defineProps<{
  parent_id: number;
  parent_type: TopicType;
}>();

const { comments, fetchComments } = useCommentReplies();

onMounted(async () => {
  comments.value = await fetchComments(props.parent_id, props.parent_type);
});
</script>

<template>
  <q-item>
    <q-item-section>
      <ReplyBox :parent-id="parent_id" :parent-type="parent_type"
        @reply="(comment: Comment) => comments.unshift(comment)" />
    </q-item-section>
  </q-item>
  <div v-if="comments.length === 0">
    No Comments, yet!
  </div>
  <q-list dense v-else>
    <CommentComponent v-for="comment in comments" :key="comment.id" :comment="comment" />
  </q-list>
</template>
