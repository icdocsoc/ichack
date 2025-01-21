<script setup lang="ts">
import type { NuxtError } from '#app';

type Props = {
  error: NuxtError;
};
const props = defineProps<Props>();

const image = computed(
  () => `https://httpducks.com/${props.error.statusCode}.jpg`
);

const handleError = () => clearError({ redirect: '/' });
useHead({
  title: props.error.statusCode.toString()
});
</script>

<template>
  <NuxtLayout name="public">
    <div
      class="mt-20 flex w-full items-center justify-center gap-16 max-lg:flex-col lg:mt-36 lg:gap-32">
      <h2
        class="font-ichack text-red-ic lg:text-horizontal text-6xl lg:rotate-180 lg:text-8xl">
        Error
      </h2>
      <div class="flex flex-col items-center gap-5">
        <img :src="image" :alt="error.statusMessage" class="max-w-96" />
        <p v-if="error.statusMessage">{{ error.statusMessage }}</p>
        <p class="cursor-pointer" @click="handleError">
          Click here to return back to home page
        </p>
      </div>
      <h2
        class="font-ichack text-red-ic lg:text-horizontal text-6xl lg:text-8xl">
        Error
      </h2>
    </div>
  </NuxtLayout>
</template>
