<template>
  <div class="flex flex-col">
    <h1 class="text-3xl font-bold lg:text-5xl">{{ data?.title }}</h1>
    <p class="text-xl lg:text-2xl">Presented to you by:</p>
    <img
      :src="data?.image"
      alt="Sponsor Logo"
      class="my-10 max-h-20 self-start" />

    <div class="flex flex-col">
      <span class="bg-blue-ic self-start px-4 py-3 font-bold">Description</span>
      <div class="max-w-[50rem] border border-white p-4">
        {{ data?.shortDescription }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '#shared/types';

// Get the slug from URL and fetch the category details
const route = useRoute();
const slug: string = (route.params.slug as string) || '';
const { getCategory } = useCategories();
const { data, error } = await useAsyncData<Category>(
  'fetch_category',
  async () => {
    const result = await getCategory(slug);
    return result.getOrThrow();
  }
);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode,
    statusMessage: error.value.message
  });
}

// NOTE: the following is decrepecated as per Directors' decision.
// shortDescription is the only available description for now.

// Fetch the markdown content from the URL
// const markdownDescription = ref<string>('');
// async function fetchMarkdownFromURL(url: string): Promise<string | null> {
//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       const message = await response.text();
//       errors.global = `Error fetching the Category! ${message}`;
//     }

//     const markdownText = await response.text(); // Get the response body as text (Markdown)
//     return markdownText;
//   } catch (error: any) {
//     errors.global = `Error fetching the Category! ${error.message}`;
//     return null;
//   }
// }
// onMounted(async () => {
//   if (data.value?.longDescription) {
//     const markdownText = await fetchMarkdownFromURL(
//       data.value?.longDescription
//     );
//     if (markdownText) {
//       markdownDescription.value = await marked(markdownText);
//     }
//   }
// });

definePageMeta({
  middleware: ['require-auth', 'require-link']
});
useHead({
  title: 'Challenge - ' + data.value?.title
});
</script>
