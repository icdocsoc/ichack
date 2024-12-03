<script setup lang="ts">
import { cva, type VariantProps } from 'cva';

const button = cva('px-1 py-2', {
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      success: 'bg-green-500 text-white',
      danger: 'bg-red-500 text-white'
    },
    size: {
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg'
    }
  }
});
type ButtonVariant = VariantProps<typeof button>;

const { intent = 'primary', size = 'sm' } = defineProps<ButtonVariant>();
</script>

<template>
  <button :class="button({ intent, size })"><slot></slot></button>
</template>
