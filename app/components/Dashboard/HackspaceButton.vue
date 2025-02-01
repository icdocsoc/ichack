<template>
  <div
    class="flex cursor-pointer items-center justify-center gap-8 bg-white p-4">
    <img :src="logo" :alt="room" class="h-8" />
    <p class="font-bold text-black">{{ room }}</p>
  </div>
</template>

<script setup lang="ts">
type Props = {
  room: string;
  logo: string;
};
defineProps<Props>();
</script>
