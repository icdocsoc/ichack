<template>
  <!-- This is incredibly weird, but if we don't have this div, the <a> overflows into the title. -->
  <div class="overflow-hidden py-4">
    <a
      class="bottom-0 cursor-pointer bg-[#5865F2] px-2 py-3 text-lg font-semibold"
      href="/api/profile/discord"
      v-if="!linkedDiscord">
      Join our Discord server!
    </a>
    <button
      class="bg-[#5865F2] p-4 text-lg font-semibold"
      @click="unlinkDiscord"
      v-else>
      Unlink your Discord account
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
