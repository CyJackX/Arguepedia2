<script setup lang="ts">
import type { Comment } from './models';
import { ref, onMounted } from 'vue';
import { supabase } from '../utils/supabase';

const props = defineProps<{
  comment: Comment;
}>();

const replies = ref<Comment[]>([]);

const fetchReplies = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_comment_id', props.comment.id);

    if (error) {
      console.error('Error fetching replies:', error);
    } else {
      replies.value = data as Comment[];
    }
  } catch (error) {
    console.error('Error fetching replies:', error);
  }
};

onMounted(() => {
  fetchReplies();
});

</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-body1">{{ comment.content }}</div>
        <div class="text-caption text-grey">
          Posted by {{ comment.username }} • {{ new Date(comment.created_at).toLocaleString() }}
        </div>
      </q-card-section>
    </q-card>
  </div>
  <q-list>
    <CommentComponent v-for="reply in replies" :key="reply.id" :comment="reply" />
  </q-list>
</template>