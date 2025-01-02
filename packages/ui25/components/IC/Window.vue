<template>
  <div class="flex flex-col border-4" :class="border">
    <div class="flex items-center justify-between px-2 py-1" :class="color">
      <div class="font-gohu text-sm text-white">{{ name }}</div>
      <span class="inline-block min-w-8"></span>
      <div class="flex space-x-2 py-1 [&>img]:w-4">
        <img src="@ui25/assets/minimise-window.svg" />
        <img src="@ui25/assets/maximise-window.svg" />
        <img src="@ui25/assets/close-window.svg" />
      </div>
    </div>
    <div class="px-3 py-2" :class="background">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  name: string;
  color?: string;
  border?: string;
  background?: string;
};

const {
  color = 'bg-blue-ic',
  border = 'border-blue-ic',
  background = 'bg-white'
} = defineProps<Props>();
</script>
