<template>
  <div class="flex flex-col border-4" :class="`${border} ${background}`">
    <div
      class="flex items-center justify-between gap-4 px-2 py-1"
      :class="color">
      <div
        class="font-lores flex-1 overflow-x-hidden text-ellipsis text-sm text-white">
        {{ name }}
      </div>
      <div class="flex space-x-2 py-1 [&>img]:w-4">
        <img src="@ui25/assets/minimise-window.svg" />
        <img src="@ui25/assets/maximise-window.svg" />
        <img src="@ui25/assets/close-window.svg" />
      </div>
    </div>
    <div class="px-3 py-2">
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
