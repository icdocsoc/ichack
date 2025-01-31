<template>
  <NuxtLink :to="`/category/${category.slug}`">
    <!-- Header Section -->
    <div
      :class="background"
      class="flex flex-col items-start gap-4 p-4 text-white">
      <img :src="category.image" :alt="category.owner" class="h-6" />
      <h2 class="text-3xl font-bold">{{ category.title }}</h2>

      <!-- Overview Section -->
      <div class="self-stretch">
        <div class="bg-white px-2 py-1 text-2xl font-bold text-black">
          Overview
        </div>
        <div class="fade max-h-60 overflow-y-hidden bg-black p-2 text-lg">
          {{ category.shortDescription }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { Category } from '#shared/types';

type Props = {
  background: string;
  category: Category;
};
defineProps<Props>();
</script>

<style scoped>
.fade {
  @apply relative;
}

.fade::after {
  @apply absolute bottom-0 left-0 h-32 w-full bg-gradient-to-b from-transparent to-black content-[''];
}
</style>
