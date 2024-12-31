<template>
  <Transition name="slide-fade">
    <div
      v-if="enabled"
      class="fixed bottom-10 left-1/2 z-10 flex w-1/2 -translate-x-1/2 items-center justify-between border-4 border-black bg-white px-4 py-2">
      <p><slot /></p>
      <button
        @click="enabled = false"
        class="ml-auto bg-gray-200 p-1 outline outline-1 outline-gray-400">
        Dismiss
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const enabled = defineModel<boolean>();
</script>

<style>
/* Copied from https://vuejs.org/guide/built-ins/transition */
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}
</style>
