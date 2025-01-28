<template>
  <div class="flex h-[80vh] flex-col place-items-center justify-center">
    <div class="max-w-[32rem]">
      <h1 class="font-ichack text-center text-4xl">Coming Soon...</h1>
      <p class="mt-5 text-center text-2xl">
        Come back nearer to the hackathon for your dashboard, profiles, teams,
        our Discord server, and more!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'require-auth'
});
</script>
