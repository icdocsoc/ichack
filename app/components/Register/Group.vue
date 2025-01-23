<template>
  <div class="flex gap-4">
    <div class="w-12 rounded bg-white p-2">
      <div class="grid h-full place-items-center">
        <img :src="icon" :alt="alt" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 py-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  icon: string;
  alt?: string;
};

defineProps<Props>();
</script>
