<template>
  <button type="button" class="bg-yellow-ic w-full cursor-pointer p-4">
    <div class="flex h-full w-full items-center justify-center gap-5">
      <span class="h-full text-left text-2xl font-bold leading-none">{{
        value
      }}</span>
      <span class="font-ichack h-full align-middle text-5xl"> > </span>
    </div>
  </button>
</template>

<script setup lang="ts">
type Props = {
  value: string;
};

defineProps<Props>();
</script>
