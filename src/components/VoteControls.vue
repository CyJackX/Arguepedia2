<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RelatedStatement } from '@/types/types';
import { useSupabase } from '@/composables/useSupabase';

const props = defineProps<{
    statement: RelatedStatement;
}>();

// Add emit definition
const emit = defineEmits<{
    (e: 'update', statement: RelatedStatement): void;
}>();

// Local state for optimistic updates
const localVoteState = ref({
    userVote: props.statement.users_vote,
    upvotes: props.statement.upvotes,
    downvotes: props.statement.downvotes
});

const isVoting = ref(false);

/**
 * Computes the vote score based on upvotes and downvotes
 * @returns {number} The vote score
 */
const voteScore = computed(() =>
    localVoteState.value.upvotes - localVoteState.value.downvotes
);

const { updateVote } = useSupabase();

/**
 * Handles the vote action for a statement relationship
 * @param {boolean} vote - true for upvote, false for downvote
 */
const handleVote = async (vote: boolean) => {
    if (isVoting.value) return;

    const oldState = { ...localVoteState.value };
    isVoting.value = true;

    const currentVote = localVoteState.value.userVote;
    
    // Case 1: Removing existing vote
    if (currentVote === vote) {
        localVoteState.value.userVote = null;
        if (vote) {
            localVoteState.value.upvotes--;
        } else {
            localVoteState.value.downvotes--;
        }
    }
    // Case 2: Adding or changing vote
    else {
        // Remove previous vote if exists
        if (currentVote !== null) {
            if (currentVote) {
                localVoteState.value.upvotes--;
            } else {
                localVoteState.value.downvotes--;
            }
        }
        
        // Add new vote
        localVoteState.value.userVote = vote;
        if (vote) {
            localVoteState.value.upvotes++;
        } else {
            localVoteState.value.downvotes++;
        }
    }
    console.log('Attempting to update vote for relationship ID:', props.statement.relationship_id, 'with vote:', vote);
    const dbResponse = await updateVote(props.statement.relationship_id, vote);
    console.log('Vote update response:', dbResponse);
    if (dbResponse !== localVoteState.value.userVote){
        console.log('Vote update failed, reverting to old state:', oldState);
        localVoteState.value = oldState;
    } else {
        console.log('Vote updated successfully');
        // Emit updated statement with new vote values
        emit('update', {
            ...props.statement,
            users_vote: localVoteState.value.userVote,
            upvotes: localVoteState.value.upvotes,
            downvotes: localVoteState.value.downvotes,
            score: localVoteState.value.upvotes - localVoteState.value.downvotes
        });
    }
    isVoting.value = false;
};
</script>

<template>
    <div class="flex gap-1 items-center">
        <button @click="handleVote(true)" :disabled="isVoting" class="vote-button" :class="{
            'text-green-500': localVoteState.userVote === true,
            'text-gray-500': localVoteState.userVote !== true,
            'opacity-50': isVoting
        }">
            ↑
        </button>
        <span>{{ voteScore }}</span>
        <button @click="handleVote(false)" :disabled="isVoting" class="vote-button" :class="{
            'text-red-500': localVoteState.userVote === false,
            'text-gray-500': localVoteState.userVote !== false,
            'opacity-50': isVoting
        }">
            ↓
        </button>
    </div>
</template>

<style scoped>
.vote-button {
    @apply cursor-pointer hover:opacity-80 transition-opacity;
    @apply disabled:cursor-not-allowed;
}
</style>