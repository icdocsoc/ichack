<template>
  <Transition name="success-transition">
    <div
      v-if="success"
      class="fixed left-1/2 top-20 z-50 w-[95vw] max-w-[512px] -translate-x-1/2 border-4 border-[#8FD62D] bg-black px-6 py-3">
      <div class="flex items-center justify-between lg:gap-28">
        <p class="font-ichack text-4xl text-[#8FD62D]">SUCCESS</p>
        <img
          src="@ui25/assets/success-icon.svg"
          class="cursor-pointer"
          @click="clear" />
      </div>
      <p class="mt-2 break-words text-2xl">{{ success }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const duration = 5000;
const success = defineModel();
let timerId: Timer;

watch(success, () => {
  if (success.value) {
    timerId = setTimeout(() => {
      success.value = '';
    }, duration);
  }
});

function clear() {
  success.value = '';
  clearTimeout(timerId);
}
</script>

<style scoped>
/* Copied from https://vuejs.org/guide/built-ins/transition */
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.success-transition-enter-active,
.success-transition-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.success-transition-enter-from,
.success-transition-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}
</style>
