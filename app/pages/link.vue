<template>
  <div
    class="flex w-full flex-col items-center py-4 md:flex-row md:items-stretch md:gap-10 md:px-[15vw] md:pt-[10vh]">
    <div class="flex flex-1">
      <img
        class="object-cover object-center md:ml-auto"
        src="../assets/scan.gif"
        alt="ID band QR code scanning demonstration" />
    </div>
    <div class="flex flex-1 flex-col items-start">
      <div class="inline-block w-full max-w-md">
        <img src="../assets/shade.svg" class="hidden w-full md:block" />
        <div class="w-full">
          <p class="py-5">
            Make sure you are logged in on your phone, then scan the QR code on
            your wristband!
          </p>
          <ICInputRegister
            class="w-full"
            value="Register your ID band"
            @click="startScan" />
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="showModal"
    class="fixed inset-0 flex h-[100vh] w-[100vw] items-center justify-center bg-black bg-opacity-50">
    <div class="rounded bg-white p-4">
      <qrcode-stream
        :constraints="constraints"
        @error="onError"
        @detect="onDetect"
        :paused="paused"></qrcode-stream>
    </div>
  </div>
  <ICError v-model="error" />
  <!-- Success Animation -->
  <transition name="fade">
    <div
      v-if="isSuccess"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-500">
      <svg
        class="animate-checkmark h-24 w-24 text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <p class="font-ichack">Success!</p>
    </div>
  </transition>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'require-auth' });

import { usePermission } from '@vueuse/core';
import { ref, watch } from 'vue';
import { QrcodeStream } from 'vue-qrcode-reader';
import type { EmittedError } from 'vue-qrcode-reader';
import type { QrCode } from '~~/shared/types';

const error = ref('');

const constraints = ref({ facingMode: 'environment' }); // front-facing

const onError = (err: EmittedError) => {
  error.value = `[${err.name}]: `;

  if (err.name === 'NotAllowedError') {
    error.value += 'you need to grant camera access permission';
  } else if (err.name === 'NotFoundError') {
    error.value += 'no camera on this device';
  } else if (err.name === 'NotSupportedError') {
    error.value += 'secure context required (HTTPS, localhost)';
  } else if (err.name === 'NotReadableError') {
    error.value += 'is the camera already in use?';
  } else if (err.name === 'OverconstrainedError') {
    error.value += 'installed cameras are not suitable';
  } else if (err.name === 'StreamApiNotSupportedError') {
    error.value += 'Stream API is not supported in this browser';
  } else if (err.name === 'InsecureContextError') {
    error.value +=
      'Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.';
  } else {
    error.value += err.message;
  }
};

interface DetectedCode {
  rawValue: string;
}

const onDetect = async (codes: DetectedCode[]) => {
  // QR code detect
  paused.value = true;
  if (codes.length > 1) {
    error.value = 'Multiple QR codes detected!';
    return;
  }
  if (codes.length < 1) return; // Hopefully unecessary
  const code = codes[0]!.rawValue;
  // POST
  const client = useHttpClient();
  const body: QrCode = {
    uuid: code
  };
  const res = await client.qr.$post({
    json: body
  });

  if (!res.ok) {
    error.value = await res.text();
    paused.value = false;
    return;
  }

  // Cool, should be 201
  if (res.status != 201) {
    error.value = 'An unknown error occurred';
    paused.value = false;
    return;
  }
  // Everything worked
  showSuccessAnimation();

  setTimeout(() => navigateTo('/'), 2000);

  showModal.value = false;
};
const paused = ref(true);

const cameraPermission = usePermission('camera');

watch(cameraPermission, newStatus => {
  if (newStatus === 'denied') {
    console.warn('Camera permission denied');
    error.value = 'Please do not deny access to the camera';
    showModal.value = false;
  }
});

const showModal = ref(false);
const startScan = async () => {
  showModal.value = true;
  paused.value = false;
};

const isSuccess = ref(false);

function showSuccessAnimation() {
  isSuccess.value = true;
}
</script>

<style scoped>
@keyframes checkmark {
  0% {
    stroke-dashoffset: 48;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    stroke-dashoffset: 0;
    transform: scale(1);
  }
}

.animate-checkmark {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkmark 1s ease-in-out forwards;
}
</style>
