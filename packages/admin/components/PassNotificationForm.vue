<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Send Push Notification</h2>
    <div class="flex flex-col space-y-2">
      <label for="message" class="text-sm font-medium text-gray-700">
        Announcement Message
      </label>
      <textarea
        id="message"
        v-model="message"
        rows="3"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="Enter your announcement message here..." />
    </div>
    <div class="flex justify-end">
      <button
        type="button"
        :disabled="!message || isLoading"
        :class="[
          'inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm',
          !message || isLoading
            ? 'cursor-not-allowed bg-indigo-300'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        ]"
        @click="sendNotification">
        <span v-if="isLoading" class="mr-2">
          <svg
            class="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        Send Notification
      </button>
    </div>
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>
    <div v-if="success" class="mt-2 text-sm text-green-600">
      Notification sent successfully!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('');
const isLoading = ref(false);
const error = ref('');
const success = ref(false);

async function sendNotification() {
  if (!message.value) return;

  isLoading.value = true;
  error.value = '';
  success.value = false;

  try {
    const response = await fetch('/api/pass/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message.value })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    success.value = true;
    message.value = ''; // Clear the message after successful send
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
}
</script>
