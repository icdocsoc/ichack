<template>
  <div class="flex flex-row">
    <div class="lg:w-2/3">
      <Announcement v-if="announcement" :announcement="announcement!" />
    </div>
  </div>
  <ICError v-model="uiError" />
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'require-auth' });
const uiError = ref('');

const route = useRoute();
const id: string = (route.params.slug as string) || '';

const { getAnnouncements } = useAnnouncements();

const { data, refresh } = await useAsyncData('announcements', async () => {
  const res = await getAnnouncements();
  if (res.isError()) {
    uiError.value = res.error.message;
  } else {
    return res.getOrNull();
  }
});

// Get specific announcement from data
const announcement = data.value?.find(a => a.id?.toString() == id);
</script>

<style></style>
