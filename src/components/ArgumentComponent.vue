<script setup lang="ts">
import { StatementType, Argument } from '@/types/types';
import { useSupabase } from '@/composables/useSupabase';
import { ref, onMounted } from 'vue';

const props = defineProps<{
    argument_id: number;
    argument_title: string;
    type: StatementType;
}>();


</script>

<template>

    <div>
        <p>{{ props.argument_title }}</p>
    </div>

</template>
