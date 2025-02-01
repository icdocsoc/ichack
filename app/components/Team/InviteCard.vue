<template>
  <div class="flex gap-4 border border-white">
    <div class="flex-1 p-4">
      <div class="flex items-center gap-2">
        <img src="@ui25/assets/pfp.svg" />
        <p>{{ name }}</p>
      </div>
    </div>
    <div
      class="grid place-items-center px-2"
      :class="
        greyed ? 'bg-gray-ic cursor-not-allowed' : 'bg-blue-ic cursor-pointer'
      ">
      <p class="text-xl">+</p>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  name: string;
  greyed?: boolean;
};
const { greyed = false } = defineProps<Props>();
</script>
