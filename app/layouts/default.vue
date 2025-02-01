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

        <!-- TODO: Announcement panel, profile/teams mini panel -->
        <div class="hidden lg:block">
          <!-- Announcements -->

          <!-- Teams Panel -->

          <!-- Profile -->
          <div class="max-w-80 p-4 outline outline-white">
            <div class="flex w-full items-center space-x-4">
              <img
                src="@ui25/assets/mugshot.svg"
                class="size-16 bg-white p-4" />
              <p class="w-full text-2xl font-semibold text-white">
                {{ profile.name }}
              </p>
            </div>

            <Hackspace
              v-if="profile.hackspace"
              :hackspace="profile.hackspace"
              class="w-full py-4" />

            <NuxtLink class="w-full cursor-pointer bg-white pb-4" to="/profile">
              <p
                class="bg-white py-2 text-center text-xl font-semibold text-black">
                Profile
              </p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import Hackspace from '~~/packages/ui25/components/IC/Hackspace.vue';

const client = useHttpClient();
const route = useRoute();
const profileStore = useProfileStore();
const profile = profileStore.profile!;

async function handleLogout() {
  await client.auth.logout.$post();
  await navigateTo('/');
}
</script>
