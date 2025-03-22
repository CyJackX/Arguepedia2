<script setup lang="ts">
/**
 * SearchBar Component
 * 
 * Responsibilities:
 * - Handles user input for statement search
 * - Manages search results dropdown
 * - Provides statement creation option
 * - Implements debounced search to prevent API spam
 */

import { ref, watch, onUnmounted, createHydrationRenderer } from 'vue';
import StatementComponent from './StatementComponent.vue';
import { useSupabase } from '@/composables/useSupabase';
import debounce from 'lodash.debounce';
import { Statement, SearchResult } from '@/types/types';
import Tooltip from './Tooltip.vue';
// === STATE MANAGEMENT ===
const search_results = ref<SearchResult[]>([]);
const isDropdownVisible = ref<boolean>(false);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const featuredStatement = ref<Statement | null>(null);

// === COMPONENT INTERFACE ===
const emits = defineEmits<{
    (e: 'select', statement: Statement): void
    (e: 'createNew', text: string): void
}>();

const { checkSimilarStatements } = useSupabase();

// === UTILITY FUNCTIONS ===
/**
 * Formats similarity score as a percentage string
 * @param {number} similarity - Similarity score between 0 and 1
 * @returns {string} Formatted percentage with % symbol
 */
const formatSimilarity = (similarity: number) => {
    return `${Math.round(similarity * 100)}%`;
};

// === SEARCH IMPLEMENTATION ===
/**
 * Debounced search function to prevent API spam
 * @param {string} query - Search query text
 * @returns {Promise<void>}
 */
const debouncedSearch = debounce(async (query: string): Promise<void> => {
    if (!query || query.trim().length < 2) {
        search_results.value = [];
    }
    try {
        search_results.value = await checkSimilarStatements(query);
    } catch (error) {
        console.error('Search error:', error);
        search_results.value = [];
    }
}, 300);

// Watch for changes in featuredStatement
watch(featuredStatement, (newStatement) => {
    if (newStatement) {
        // When a statement is selected, update the input field with its text
        if (inputRef.value) {
            inputRef.value.textContent = newStatement.statement_text;
        }
        // Clear search results since we've selected a statement
        search_results.value = [];
    }
}
);

// === EVENT HANDLERS ===


const handleInput = (e: { target: { textContent: string | any[]; firstChild: Node; }; }) => {
    featuredStatement.value = null;
    // Save cursor position
    const selection = window.getSelection(); // Get the current selection from the window
    if (!selection) return;
    const range = selection.getRangeAt(0); // Get the range of the current selection
    let cursorPosition = range.startOffset; // Store the starting offset of the cursor
    let originalLength = e.target.textContent.length;

    // Sanitize and update the content 
    const sanitized = sanitizeText(e.target.textContent as string); // Sanitize the input text
    e.target.textContent = sanitized;  // Update the displayed content with sanitized text

    // Adjust cursor position if the sanitized text is shorter
    if (sanitized.length < originalLength) {
        cursorPosition -= (originalLength - sanitized.length);
    }

    // Restore cursor position
    range.setStart(e.target.firstChild, cursorPosition); // Set the start of the range to the cursor position
    range.collapse(true); // Collapse the range to the start point
    selection.removeAllRanges(); // Remove any existing selections
    selection.addRange(range); // Add the updated range back to the selection

    isDropdownVisible.value = true; // Make the dropdown visible
    debouncedSearch(sanitized); // Trigger the debounced search with the updated query
}

const handleSelect = (result: SearchResult) => {
    emits('select', result);
    featuredStatement.value = result;
    isDropdownVisible.value = false;
};

const createNew = (text: string) => {
    console.log('Create New Statement selected:', text);
    emits('createNew', text);
    isDropdownVisible.value = false;
}

// === CLEANUP ===
onUnmounted(() => {
    debouncedSearch.cancel();
});

const sanitizeText = (text: string) => {
    // console.log('sanitizeText', text+"---");
    let sanitized = text
        //  .replace(/\s+/g, ' ')                     // prevent multiple spaces
        .replace(/[^a-zA-Z0-9\s.,!?'"'#$%&*()-]/g, '');  // only allow these specific characters
    // console.log('sanitized', sanitized+"---");
    return sanitized;
};

const setFeaturedStatement = (statement: Statement) => {
    featuredStatement.value = statement;
}

defineExpose({ setFeaturedStatement });
</script>

<template>
    <div class="relative">
        <StatementComponent>
            <div class="flex flex-col">
                <p ref="inputRef" contenteditable="true" @input="handleInput" @focus="() => isDropdownVisible = true"
                    class="text-md text-center font-semibold outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400"
                    placeholder="Enter a statement to search or create...">
                </p>
            </div>
            <template #bottom>
                <div class="flex flex-row justify-end gap-2">
                    <span v-if="!featuredStatement">
                        {{ inputRef?.textContent?.length }}/140
                    </span>
                    <Tooltip v-else="featuredStatement" :data="featuredStatement" />
                </div>
            </template>
        </StatementComponent>


        <!-- Results dropdown - repositioned below the card -->
        <div v-if="isDropdownVisible"
            class="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
            <!-- Existing statement results -->
            <div v-for="result in search_results" :key="result.id" @mousedown="handleSelect(result)"
                class="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                <span class="flex-1 text-xs sm:text-md">{{ result.statement_text }}</span>
                <span v-if="result.similarity" class="text-sm text-gray-500 ml-2">
                    {{ formatSimilarity(result.similarity) }} match
                </span>
            </div>

            <!-- New statement option -->
            <div v-if="!featuredStatement && inputRef?.textContent?.trim()" @mousedown="createNew(inputRef.textContent.trim())"
                class="p-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 flex justify-between items-center">
                <span class="flex-1 text-xs sm:text-md">{{ inputRef.textContent }}</span>
                <strong>Create New</strong>
            </div>
        </div>
    </div>
</template>
