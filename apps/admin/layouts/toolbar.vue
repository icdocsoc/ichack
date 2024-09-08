<script setup lang="ts">
const { user } = useUserStore();

const name = computed(() => user?.name.split(' ')[0]);
</script>

<template>
  <div class="w-screen h-screen flex">
    <div class="h-full px-6 py-4 border-r border-gray-200 dark:border-gray-800">
      <h1>Welcome, {{ name ?? 'null' }}</h1>
      <Toolbar class="mt-5" />
    </div>
    <div class="flex-1 h-full">
      <slot></slot>
    </div>
  </div>
</template>
