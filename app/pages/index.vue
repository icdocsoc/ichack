<template>
  <div class="mt-5 flex h-[80vh] flex-col place-items-center justify-center">
    <div class="max-w-[32rem]">
      <img class="mx-auto w-[50px]" src="~/assets/icon_cube.svg" />
      <h1
        class="font-ichack mt-7 text-center text-[clamp(2rem,6vw,2.5rem)] md:text-4xl">
        Get Ready...
      </h1>
      <p
        class="mt-5 text-center text-[clamp(1.2rem,3vw,1.25rem)] text-gray-200 md:text-xl">
        Come back here soon for your dashboard, profiles, teams, and more! For
        now...
      </p>
      <div class="h-5"></div>
      <Discord
        :linked-discord="profile.discord_id != null"
        @unlinked="profile.discord_id = null" />
      <div class="h-[75px] md:h-[110px]"></div>
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
    <p class="mt-3 max-w-[32rem] text-center text-sm text-gray-400">
      Don't worry if you don't have a digital wallet set up - you'll be able to
      access your entry ticket right here on the day.
    </p>
  </div>
  <div class="h-20"></div>
</template>

<script setup lang="ts">
import AppleWalletButton from '~~/packages/admin/components/AppleWalletButton.vue';
import GoogleWalletButton from '~~/packages/admin/components/GoogleWalletButton.vue';

definePageMeta({
  middleware: 'require-auth'
});

const profileStore = useProfileStore();
const profile = profileStore.profile!;
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
</script>
