<script lang="ts" setup>
definePageMeta({
  middleware: ['require-auth']
});

useTitle('Dashboard');
</script>

<template>
  <NuxtLayout name="toolbar"></NuxtLayout>
</template>
