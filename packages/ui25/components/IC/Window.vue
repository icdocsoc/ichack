<template>
  <div class="flex flex-col border-4" :class="`${border} ${background}`">
    <div
      class="flex items-center justify-between gap-4 px-2 py-1"
      :class="color">
      <div
        :class="titleTheme === 'light' ? 'text-white' : 'text-black'"
        class="font-lores flex-1 overflow-x-hidden text-ellipsis">
        {{ name }}
      </div>
      <slot name="controls">
        <div class="flex space-x-2 py-1 [&>img]:w-4">
          <img :src="images.minimise" />
          <img :src="images.maximise" />
          <img :src="images.close" />
        </div>
      </slot>
    </div>
    <div class="px-3 py-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { filename } from 'pathe/utils';

type Props = {
  name: string;
  color?: string;
  border?: string;
  background?: string;
  titleTheme?: 'light' | 'dark';
};

const {
  color = 'bg-blue-ic',
  border = 'border-blue-ic',
  background = 'bg-white',
  titleTheme = 'light'
} = defineProps<Props>();

const lightSvgs = import.meta.glob('@ui25/assets/windowActions/light/*.svg', {
  eager: true
});
const darkSvgs = import.meta.glob('@ui25/assets/windowActions/dark/*.svg', {
  eager: true
});

const images = computed(() => {
  const glob = titleTheme === 'light' ? lightSvgs : darkSvgs;
  return Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value.default])
  );
});
</script>
