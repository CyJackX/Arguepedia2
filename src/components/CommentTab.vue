<script setup lang="ts">
import { onMounted } from 'vue';
import type { TopicType, Comment } from '../types/models';
import { useCommentReplies } from '../composables/useComments';
import ReplyBox from '../components/ReplyBox.vue';
import CommentComponent from '../components/CommentComponent.vue';
import { ref } from 'vue';
const props = defineProps<{
  parent_id: number;
  parent_type: TopicType;
}>();

const { comments, fetchComments } = useCommentReplies();
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  comments.value = await fetchComments(props.parent_id, props.parent_type);
  isLoading.value = false;
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
  <q-list dense v-else-if="!isLoading">
    <CommentComponent v-for="comment in comments" :key="comment.id" :comment="comment" />
  </q-list>
  <q-list dense v-else>
    <q-item>
      <q-item-section>
        <q-item-label>Loading...</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
