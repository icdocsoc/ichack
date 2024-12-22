<script setup lang="ts">
type Emits = {
  toggle: [value: boolean];
};
const emits = defineEmits<Emits>();

const active = ref<boolean>(false);
function handleToggle() {
  active.value = !active.value;
  emits('toggle', active.value);
}
</script>

<template>
  <div
    class="flex aspect-[4/3] cursor-pointer flex-col justify-between"
    :class="{ active }"
    @click="handleToggle">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
span {
  @apply h-0.5 w-full origin-left bg-white opacity-100 transition-all duration-500 ease-in-out;
}

.active span:nth-of-type(1) {
  @apply rotate-45;
}

.active span:nth-of-type(2) {
  @apply opacity-0;
}

.active span:nth-of-type(3) {
  @apply -rotate-45;
}
</style>
