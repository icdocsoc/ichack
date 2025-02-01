<template>
  <div class="flex w-full justify-between">
    <div class="flex items-center gap-x-2 pb-2">
      <img :src="image" :alt="title" class="size-8" />
      <p class="text-xl font-semibold">{{ title }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
type Props = {
  image: string;
  title: string;
};

defineProps<Props>();
</script>
