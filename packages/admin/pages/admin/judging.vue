<template>
  <div class="flex flex-wrap gap-x-3 pl-3">
    <div v-for="category in data" :key="category.category">
      <JudgingCategory
        :company="category.company"
        :title="category.title"
        v-model="category.hackspace"
        :slug="category.slug"
        :isAdmin="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAllJudging } = useCategories();

const { data, error } = await useAsyncData('get_all_categories', async () => {
  const result = await getAllJudging();
  return result.getOrThrow();
});

definePageMeta({
  middleware: ['require-auth'],
  layout: 'admin'
});
useHead({
  title: 'Judging'
});
</script>
