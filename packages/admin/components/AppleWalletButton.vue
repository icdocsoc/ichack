<template>
  <button @click="handleClick">
    <img
      class="h-auto w-40"
      src="@/assets/images/apple-wallet.svg"
      alt="Add to Apple Wallet" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  role: string;
  qrText: string;
}

const props = defineProps<Props>();
const client = useHttpClient();

const handleClick = async () => {
  try {
    const response = await client.pass.generate.$post({
      json: {
        name: props.name,
        role: props.role,
        qrText: props.qrText
      },
      headers: {
        Accept: 'application/vnd.apple.pkpass'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to generate pass');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    window.location.href = url;

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Error generating pass:', error);
    alert('Failed to generate Apple Wallet pass. Please try again.');
  }
};
</script>
