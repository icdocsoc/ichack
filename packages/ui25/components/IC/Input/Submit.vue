<template>
  <input
    type="submit"
    class="bg-blue-ic hover:bg-yellow-ic cursor-pointer rounded px-1 py-2 text-2xl font-semibold transition-colors duration-200 ease-in-out"
    :value="value" />
</template>

<script setup lang="ts">
type Props = {
  value: string;
};

defineProps<Props>();
</script>
