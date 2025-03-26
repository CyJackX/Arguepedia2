<script setup lang="ts">
import type { Comment } from './models';
import { ref, onMounted } from 'vue';
import { useSupabase } from '../composables/useSupabase';
import { format } from 'timeago.js';

const props = defineProps<{
  comment: Comment;
}>();

const replies = ref<Comment[]>([]);
const replying = ref(false);
const reply = ref('');
const expanded = ref(false);
const supabase = useSupabase();

onMounted(async () => {
  replies.value = await supabase.fetchComments(props.comment.id, 'comment');
});

const replyToComment = () => {
  replying.value = true;
}

const sendReply = async () => {
  const newComment = await supabase.createComment(props.comment.id, 'comment', reply.value);
  if (newComment) {
    replies.value.unshift(newComment);
    replying.value = false;
    reply.value = '';
  }

}

</script>

<template>
  <q-item dense>
    <q-item-section>
      <q-item-label>{{ comment.content }}
      </q-item-label>
      <q-item-label caption>
        <q-btn flat dense no-caps @click="replyToComment">
          <template #default>
            Reply to {{ comment.username }} • {{ format(comment.created_at) }}
          </template>
        </q-btn>
      </q-item-label>
    </q-item-section>
  </q-item>
  <div class="q-ml-md replies q-pl-sm">
    <div v-if="replying" class="reply-form q-ma-sm">
      <q-input class="q-mb-sm" outlined autogrow maxlength="200" v-model="reply" />
      <q-btn label="Reply" @click="sendReply" />
    </div>
    <q-expansion-item v-model="expanded">
      <q-list dense v-if="expanded">
        <CommentComponent v-for="reply in replies" :key="reply.id" :comment="reply" />
      </q-list>
    </q-expansion-item>
  </div>
</template>

<style scoped>
.replies {
  border-left: 1px solid #ccc;
}
</style>
