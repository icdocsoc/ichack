<template>
  <!-- Showing the user's uid as a qr code only if theyre a hacker -->
  <div
    class="flex justify-center gap-10 max-lg:flex-col max-lg:items-center lg:mt-36 lg:gap-32">
    <div>
      <div class="border border-white">
        <img v-if="qrCode" :src="qrCode" :alt="store.profile!.id" />
      </div>
      <p class="mt-4 uppercase">UID: {{ store.profile!.id }}</p>
    </div>
    <div class="flex flex-col gap-4">
      <div
        class="flex items-center justify-between border border-white px-4 py-3">
        <img src="@ui25/assets/pfp.svg" :alt="`${givenNames} ${lastName}`" />
        <div class="flex-1 text-ellipsis text-end">
          <p class="text-2xl font-semibold">{{ givenNames }}</p>
          <p class="text-xl">{{ lastName }}</p>
        </div>
      </div>

      <NuxtLink
        to="/link"
        class="bg-yellow-ic flex items-center justify-between px-3 py-2 text-white">
        <div class="flex-1 text-ellipsis">
          <p class="text-2xl font-bold">Register your ID band</p>
          <p>Scan its QR Code!</p>
        </div>

        <p class="font-ichack text-3xl">></p>
      </NuxtLink>

      <ICInputCheckbox
        title="Photos Opt Out"
        name="photosOptOut"
        description="Remember to collect your red sticker"
        :modelValue="photosOptOut"
        @update:modelValue="updatePhotosOptOut" />

      <div class="flex flex-row items-center justify-center space-x-10">
        <AppleWalletButton
          :name="store.profile!.name"
          :role="capitalize(store.profile!.role) || 'Hacker'"
          :qr-text="store.profile!.id" />
        <GoogleWalletButton
          :name="store.profile!.name"
          :role="capitalize(store.profile!.role) || 'Hacker'"
          :qr-text="store.profile!.id" />
      </div>

      <p class="hidden text-gray-400 md:block">
        Open this page on your phone to add to your Apple/Google Wallet.
      </p>
    </div>

    <ICError v-model="errors.global" />
  </div>
</template>

<script lang="ts" setup>
import AppleWalletButton from '~~/packages/admin/components/AppleWalletButton.vue';
import GoogleWalletButton from '~~/packages/admin/components/GoogleWalletButton.vue';

import QRCode from 'qrcode';

const errors = reactive({
  global: ''
});

/**
 * A base64 encoded image of a QR code
 *
 * @param text The text to generate the QR code for
 */
const generateQRCode = async (text: string) => {
  try {
    const url = await QRCode.toDataURL(text, {
      width: 300,
      scale: 10,
      color: {
        dark: '#FFFFFF',
        light: '#000000'
      }
    });
    return url;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const store = useProfileStore();
const qrCode = ref<string | null>(null);
onMounted(async () => {
  qrCode.value = await generateQRCode(store.profile!.id);
});

const givenNames = store.profile!.name.split(' ').slice(0, -1).join(' ');
const lastName = store.profile!.name.split(' ').slice(-1).join(' ');

const photosOptOut = ref<boolean>(true);
const { updateProfile } = useProfile();
let timer: number | null = null;
const updatePhotosOptOut = (value: boolean) => {
  photosOptOut.value = value;

  clearTimeout(timer);
  timer = setTimeout(async () => {
    // Update the user's profile
    const result = await updateProfile({
      photos_opt_out: value
    });

    if (result.isError()) {
      errors.global = result.error.message;
      return;
    }
  }, 300);
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// generate a qr code using the user's id
definePageMeta({
  middleware: [
    'require-auth',
    function checkHacker() {
      const store = useProfileStore();
      if (store.profile!.role !== 'hacker') {
        return navigateTo('/');
      }
    }
  ]
});
useHead({
  title: 'Your Ticket'
});
</script>
