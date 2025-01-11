<template>
  <Transition name="error-transition">
    <div
      v-if="error"
      class="border-red-ic fixed left-1/2 top-20 z-50 max-w-[512px] -translate-x-1/2 border-4 bg-black px-6 py-3">
      <div class="flex items-center justify-between gap-28">
        <p class="text-red-ic font-ichack text-4xl">ERROR</p>
        <img
          src="@ui25/assets/error.svg"
          class="cursor-pointer"
          @click="clear" />
      </div>
      <p class="mt-2 break-words text-2xl">{{ error }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const duration = 5000;
const error = defineModel();
let timerId: Timer;

watch(error, () => {
  if (error.value) {
    timerId = setTimeout(() => {
      error.value = '';
    }, duration);
  }
});

function clear() {
  error.value = '';
  clearTimeout(timerId);
}
</script>

<style scoped>
/* Copied from https://vuejs.org/guide/built-ins/transition */
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.error-transition-enter-active,
.error-transition-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.error-transition-enter-from,
.error-transition-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}
</style>
