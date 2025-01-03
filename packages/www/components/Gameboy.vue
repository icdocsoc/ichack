<template>
  <div
    class="min-w-80 rounded-2xl rounded-br-[5rem] bg-[#ded8ce] px-10 py-6 max-md:w-full md:aspect-[2/3] md:px-5 md:py-4">
    <!-- Screen Frame -->
    <div
      class="bg-cream-ic relative aspect-[4/3] w-full rounded-2xl rounded-br-[5rem] p-6 outline outline-2 outline-black">
      <!-- Screen -->
      <div class="relative h-full w-full overflow-hidden rounded-2xl bg-black">
        <video
          muted
          autoplay
          preload="metadata"
          loading="lazy"
          loop
          disablepictureinpicture
          class="absolute h-full w-full object-cover">
          <source src="/videos/gameboy-video.mp4" type="video/mp4" />
          <p>Your browser doesn't support HTML video.</p>
        </video>

        <!-- Overlay retro theme -->
        <div
          :class="overlayColor"
          class="absolute top-0 z-30 h-full w-full rounded-2xl opacity-35"></div>

        <!-- Topscreen glare -->
        <div
          :class="selectedColorFrom"
          class="absolute top-0 z-50 h-full w-full rounded-2xl bg-gradient-to-b to-30%"></div>

        <!-- Elliptical glare -->
        <div
          class="screen-glare absolute right-2 top-[25%] z-0 aspect-square w-24 rounded-full"></div>
      </div>

      <!-- Screen Frame bolts -->
      <span
        class="absolute left-2 top-2 aspect-square w-4 rounded-full bg-black"></span>
      <span
        class="absolute right-2 top-2 aspect-square w-4 rounded-full bg-black"></span>
      <span
        class="absolute bottom-2 left-2 aspect-square w-4 rounded-full bg-black"></span>
    </div>

    <div class="mt-8 w-full px-4">
      <!-- Controls section -->
      <div class="flex justify-between">
        <!-- Arrow keys with yellow center -->
        <div class="grid grid-cols-3 grid-rows-3">
          <div class="col-start-2 bg-black"></div>
          <div class="row-start-2 bg-black"></div>
          <div class="col-start-2 aspect-square w-8 bg-black">
            <div
              :class="colors['yellow-ic'].bg"
              @click="changeColor('yellow-ic')"
              class="h-full w-full cursor-pointer rounded-full"></div>
          </div>
          <div class="col-start-3 bg-black"></div>
          <div class="col-start-2 bg-black"></div>
        </div>

        <!-- A and B with red and blue -->
        <div
          class="grid aspect-square w-24 -rotate-45 scale-110 place-items-center">
          <div
            class="inline-flex w-full items-center justify-between rounded-b-full rounded-t-full bg-black p-2">
            <div
              :class="colors['red-ic'].bg"
              @click="changeColor('red-ic')"
              class="aspect-square w-7 cursor-pointer rounded-full outline outline-2 outline-white"></div>

            <div
              :class="colors['blue-ic'].bg"
              @click="changeColor('blue-ic')"
              class="aspect-square w-7 cursor-pointer rounded-full outline outline-2 outline-white"></div>
          </div>
        </div>
      </div>

      <!-- Design -->
      <div class="ml-12 mt-8 flex w-full gap-1 max-md:hidden">
        <div
          v-for="i in 2"
          :key="i"
          class="grid aspect-[1] w-10 rotate-45 place-items-center">
          <div class="h-full w-2 rounded-b-full rounded-t-full bg-black"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import resolveConfig from 'tailwindcss/resolveConfig';
// @ts-ignore this file exists
import tailwindConfig from '@ui25/tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const colors = {
  'red-ic': {
    bg: 'bg-red-ic',
    from: 'from-red-ic'
  },
  'blue-ic': {
    bg: 'bg-blue-ic',
    from: 'from-blue-ic'
  },
  'yellow-ic': {
    bg: 'bg-yellow-ic',
    from: 'from-yellow-ic'
  }
} as const;
type Color = keyof typeof colors;

const selectedColor = ref<Color>('red-ic');
const selectedColorHex = computed(
  () => fullConfig.theme.colors[selectedColor.value]
);
const selectedColorFrom = computed(() => colors[selectedColor.value].from);

const changeColor = (color: Color) => {
  selectedColor.value = color;
};

const overlayColor = computed(() => {
  switch (selectedColor.value) {
    case 'red-ic':
      return 'bg-[#FF69B4]';
    case 'blue-ic':
      return 'bg-[#7DF9FF]';
    case 'yellow-ic':
      return 'bg-[#FFFF33]';
  }
});
</script>

<style scoped>
.screen-glare {
  background: radial-gradient(
    ellipse 90% 60% at center,
    v-bind(selectedColorHex) 0%,
    transparent 80%
  );
  transform: rotate(30deg);
  opacity: 30%;
}
</style>
