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
    class="flex aspect-[4/3] cursor-pointer flex-col items-end justify-between"
    :class="{ active }"
    @click="handleToggle">
    <span class="w-full"></span>
    <span class="w-2/3"></span>
    <span class="w-1/3"></span>
  </div>
</template>

<style scoped>
span {
  @apply h-1 origin-left bg-white opacity-100 transition-all duration-500 ease-in-out;
}
</style>
