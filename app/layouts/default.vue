<template>
  <NuxtLayout name="public">
    <img
      class="fixed bottom-0 mb-4 h-fit cursor-pointer"
      src="~/assets/logout.svg"
      @click="handleLogout" />

    <div class="ml-10 mt-4 flex">
      <main class="flex-1">
        <slot />
      </main>

      <!-- TODO: Announcement panel, profile/teams mini panel -->
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const client = useHttpClient();

async function handleLogout() {
  await client.auth.logout.$post();
  await navigateTo('/');
}
</script>
