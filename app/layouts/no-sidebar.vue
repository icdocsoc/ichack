<template>
  <NuxtLayout name="public">
    <!-- <img
      class="fixed bottom-0 mb-4 h-fit cursor-pointer"
      src="~/assets/logout.svg"
      @click="handleLogout" /> -->

    <div class="mt-4 lg:mx-10">
      <h1 class="text-4xl font-semibold" v-if="route.meta.heading">
        {{ route.meta.heading }}
      </h1>
      <div class="flex space-x-12">
        <main class="flex-1">
          <slot />
        </main>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const client = useHttpClient();
const route = useRoute();
const profileStore = useProfileStore();
const profile = profileStore.profile!;

async function handleLogout() {
  await client.auth.logout.$post();
  await navigateTo('/');
}
</script>
