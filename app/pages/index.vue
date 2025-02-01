<template>
  <div class="mt-5 flex h-[80vh] flex-col place-items-center justify-center">
    <div class="max-w-[32rem]">
      <img class="mx-auto w-[50px]" src="~/assets/icon_cube.svg" />
      <h1
        class="font-ichack mt-7 text-center text-[clamp(2rem,6vw,2.5rem)] md:text-4xl">
        You're almost there!
      </h1>
      <p
        class="mt-5 text-center text-[clamp(1.2rem,3vw,1.25rem)] text-gray-200 md:text-xl">
        Link your wristband for your IC Hack '25 to get started.
      </p>
      <div class="h-5"></div>
      <Discordf
        :linked-discord="profile.discord_id != null"
        @unlinked="profile.discord_id = null" />

      <div class="flex w-full justify-center">
        <NuxtLink
          class="max-w-fit rounded-xl bg-white px-2 py-2 text-lg font-bold text-black"
          to="/link">
          Link Your Wristband
        </NuxtLink>
      </div>

      <div class="h-[30px] md:h-[70px]"></div>
      <img class="mx-auto w-[500px]" src="~/assets/divider3.svg" />
      <p class="mt-7 text-center text-gray-200 md:text-xl">
        Add your IC Hack '25 event ticket to your digital wallet to be ready for
        the big day!
      </p>
    </div>
    <div class="h-10"></div>
    <div class="flex flex-row items-center space-x-10">
      <AppleWalletButton
        :name="profile.name"
        :role="capitalize(profile.role) || 'Hacker'"
        :qr-text="profile.id" />
      <GoogleWalletButton
        :name="profile.name"
        :role="capitalize(profile.role) || 'Hacker'"
        :qr-text="profile.id" />
    </div>
    <div class="h-5"></div>
    <NuxtLink
      class="mt-2 max-w-fit rounded-xl bg-white px-2 py-2 text-lg font-bold text-black"
      to="/ticket">
      Your Ticket
    </NuxtLink>
    <!-- <p class="mt-3 max-w-[32rem] text-center text-sm text-gray-400">
      Don't worry if you don't have a digital wallet set up - you'll be able to
      access your entry ticket right here on the day.
    </p> -->
  </div>
  <div class="h-20"></div>
</template>

<script setup lang="ts">
import AppleWalletButton from '~~/packages/admin/components/AppleWalletButton.vue';
import GoogleWalletButton from '~~/packages/admin/components/GoogleWalletButton.vue';

definePageMeta({
  middleware: ['require-auth'],
  layout: 'no-sidebar'
});

const profileStore = useProfileStore();
const profile = profileStore.profile!;
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
</script>
