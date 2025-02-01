<template>
  <input
    v-model="modelValue"
    :title="error"
    :class="[
      'error:outline-red-ic focus:outline-blue-ic rounded bg-black p-2 outline outline-1 transition-all',
      error ? 'outline-red-ic' : 'outline-white'
    ]"
    :disabled="frozen" />
</template>

<script setup lang="ts">
type Props = {
  error?: string;
  frozen?: boolean;
};

defineProps<Props>();
const modelValue = defineModel();
</script>
