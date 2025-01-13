<template>
  <div v-if="open" :class="`${fullscreenClass}`" @click="fullscreen = false">
    <div
      class="flex w-full flex-col border-4"
      :class="`${border} ${background} ${fullscreen ? 'max-h-[90vh] max-w-fit' : 'h-full'}`"
      @click="e => e.stopPropagation()">
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
            <img
              :src="images.minimise"
              :class="fullscreen ? 'cursor-pointer' : 'cursor-not-allowed'"
              @click="fullscreen = false" />
            <img
              :src="images.maximise"
              class="cursor-pointer"
              @click="handleMaximize" />
            <img
              :src="images.close"
              class="cursor-pointer"
              @click="handleClose" />
          </div>
        </slot>
      </div>
      <div class="px-3 py-2">
        <slot />
      </div>
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

const open = ref(true);
const fullscreen = ref(false);
const fullscreenClass = computed(() =>
  fullscreen.value
    ? 'fixed inset-0 z-10 flex items-center max-w-full justify-center bg-black/50 p-8'
    : ''
);

function handleMaximize(e: MouseEvent) {
  fullscreen.value = !fullscreen.value;
  if (fullscreen.value) {
    document.addEventListener('keydown', handleKeydown);
  }
  e.stopPropagation();
}

function handleMinimize() {
  fullscreen.value = false;
  document.removeEventListener('keydown', handleKeydown);
}

function handleClose() {
  handleMinimize();
  open.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key != 'Escape') return;
  fullscreen.value = false;
}
</script>
