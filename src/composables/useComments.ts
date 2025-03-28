import { ref } from 'vue';
import type { Comment, TopicType } from '../components/models';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../utils/supabase';

export function useCommentReplies() {
  const authStore = useAuthStore();
  const comments = ref<Comment[]>([]);
  const replying = ref(false);
  const reply = ref('');
  const expanded = ref(false);

  const fetchComments = async (parent_id: number, parent_type: TopicType): Promise<Comment[]> => {
    try {
      console.log('Fetching comments for parent ID:', parent_id, 'parent type:', parent_type);
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles (username)')
        .eq('parent_id', parent_id)
        .eq('parent_type', parent_type);

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      const comments = data.map((comment) => ({
        ...comment,
        username: comment.profiles.username,
      }));
      return comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const createComment = async (
    parent_id: number,
    parent_type: TopicType,
    content: string,
  ): Promise<Comment | null> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: authStore.user?.id,
          parent_id,
          parent_type,
          content,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  };

  const toggleReplying = () => {
    replying.value = !replying.value;
  };

  const toggleExpanded = () => {
    expanded.value = !expanded.value;
  };

  const sendReply = async (parentId: number, parentType: TopicType) => {
    const newComment = await createComment(parentId, parentType, reply.value);
    if (newComment) {
      comments.value.unshift(newComment);
      replying.value = false;
      reply.value = '';
    }
  };

  return {
    comments,
    replying,
    reply,
    expanded,
    fetchComments,
    toggleReplying,
    toggleExpanded,
    sendReply,
  };
}
