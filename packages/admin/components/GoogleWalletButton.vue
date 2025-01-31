<!-- Same functionality as Apple Wallet button but with Google branding -->
<template>
  <button @click="generatePass">
    <img
      class="h-[50px] w-auto"
      src="@/assets/images/google-wallet.svg"
      alt="Add to Google Wallet" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
  role: string;
  qrText: string;
}>();

const config = useRuntimeConfig();

async function generatePass() {
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/pass/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: props.name,
        role: props.role,
        qrText: props.qrText
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate pass');
    }

    // Get the pass data as a blob
    const blob = await response.blob();
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    // Create a temporary link and click it to download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ichack25.pkpass';
    document.body.appendChild(a);
    a.click();
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error generating pass:', error);
    alert('Failed to generate pass. Please try again later.');
  }
}
</script>
