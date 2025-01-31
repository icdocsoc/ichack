<template>
  <div class="flex justify-center overflow-hidden py-4">
    <a
      class="shadow-[inset_0_-4px_6px_rgba(106, 92, 250, 0.5)] inline-flex h-12 items-center rounded-xl bg-[#5663F2] pl-4 pr-4 text-base font-semibold ring-1 ring-gray-300/75"
      href="/api/profile/discord"
      v-if="!linkedDiscord">
      <img
        src="~/assets/discord-white-icon.svg"
        alt="Discord"
        class="mr-2.5 h-10 w-10" />
      <div class="flex flex-col items-start py-0.5">
        <span class="text-xs font-normal">Join our</span>
        <span class="text-lg font-semibold leading-none md:font-medium"
          >Discord Server</span
        >
      </div>
    </a>
    <button
      class="shadow-[inset_0_-4px_6px_rgba(106, 92, 250, 0.5)] inline-flex h-12 items-center rounded-xl bg-[#000000] pl-2 pr-4 text-base font-semibold ring-1 ring-gray-200/30"
      @click="unlinkDiscord"
      v-else>
      <img
        src="~/assets/discord-icon.svg"
        alt="Discord"
        class="mr-1 h-11 w-11" />
      <div class="flex flex-col items-start py-0.5">
        <span class="text-xs font-normal">Unlink your</span>
        <span class="text-lg font-medium leading-none">Discord Account</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
type Props = {
  linkedDiscord: boolean;
};
const client = useHttpClient();
const emit = defineEmits(['unlinked']);
defineProps<Props>();
const unlinkDiscord = async () => {
  await client.profile.discord.$delete();
  emit('unlinked');
};
</script>
