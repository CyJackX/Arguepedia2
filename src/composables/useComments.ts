import { ref } from 'vue';
import type { Comment, TopicType } from '../types/models';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../utils/supabase';

export function useCommentReplies() {
  const authStore = useAuthStore();
  const comments = ref<Comment[]>([]);
  const replying = ref(false);
  const reply = ref('');
  const expanded = ref(false);
  const direct_comments_count = ref(0);

  const fetchComments = async (
    parent_id: number,
    parent_type: TopicType,
    offset: number = 0,
    limit: number = 10,
  ): Promise<Comment[]> => {
    try {
      console.log('Fetching comments for parent ID:', parent_id, 'parent type:', parent_type);
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles (username)')
        .eq('parent_id', parent_id)
        .eq('parent_type', parent_type)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

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
        .select('*, profiles (username)')
        .single();
      if (error) throw error;
      return {
        ...data,
        username: data.profiles.username,
      };
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

  const sendReply = async (parentId: number, parentType: TopicType): Promise<Comment | null> => {
    console.log('Sending reply to', parentId, 'parent type:', parentType, 'reply:', reply.value);
    const newComment = await createComment(parentId, parentType, reply.value);
    if (newComment) {
      console.log('New comment created ID:', newComment.id);
      replying.value = false;
      reply.value = '';
      return newComment;
    } else {
      console.error('API Error sending reply:');
      return null;
    }
  };

  const countDirectReplies = async (parent_id: number, parent_type: TopicType): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('count')
        .eq('parent_id', parent_id)
        .eq('parent_type', parent_type);
      if (error) throw error;
      return data[0]?.count || 0;
    } catch (error) {
      console.error('Error counting direct replies:', error);
      return 0;
    }
  };

  const loadMoreComments = async (parent_id: number, parent_type: TopicType) => {
    const newComments = await fetchComments(parent_id, parent_type, comments.value.length);
    comments.value.push(...newComments);
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
    countDirectReplies,
    loadMoreComments,
    direct_comments_count,
  };
}
