<template>
  <div class="flex flex-col gap-2">
    <label class="text-2xl font-semibold">{{ label }}</label>
    <slot />
  </div>
</template>

<script setup lang="ts">
type Props = {
  label: string;
};
defineProps<Props>();
</script>
