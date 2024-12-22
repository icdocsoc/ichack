<template>
  <div class="flex min-h-fit items-end gap-x-4 px-5 pb-4 pt-6">
    <p :class="size == 'large' ? 'text-9xl' : 'text-5xl'">
      {{ value < 10 ? '0' + value : value }}
    </p>
    <p :class="size == 'large' ? 'text-md' : 'text-sm'">{{ unit }}</p>
  </div>
</template>

<script lang="ts" setup>
type Props = {
  value: number;
  unit: String;
  size: 'large' | 'small';
};

const { value, unit } = defineProps<Props>();
</script>
