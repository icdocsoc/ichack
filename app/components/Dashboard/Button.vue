<script setup lang="ts">
type Props = {
  background: string;
};
defineProps<Props>();

const opened = defineModel<boolean>();
</script>

<template>
  <div
    class="blue-ic flex cursor-pointer items-center justify-between px-4 py-3"
    :class="opened ? 'border border-white bg-transparent' : background"
    @click="opened = !opened">
    <p class="max-w-min text-3xl font-bold"><slot></slot></p>
    <p
      class="font-ichack text-3xl transition-transform"
      :class="{ 'rotate-90': opened }">
      >
    </p>
  </div>
</template>
