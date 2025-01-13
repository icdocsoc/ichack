<script setup lang="ts">
const { profile } = useProfileStore();

const name = computed(() => profile?.name.split(' ')[0]);
</script>

<template>
  <div class="flex h-screen w-screen">
    <div class="h-full border-r border-gray-200 px-6 py-4 dark:border-gray-800">
      <h1>Welcome, {{ name ?? 'null' }}</h1>
      <Toolbar class="mt-5" />
    </div>
    <div class="h-full flex-1">
      <slot></slot>
    </div>
  </div>
</template>
