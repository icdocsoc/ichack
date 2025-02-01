<template>
  <p v-if="status === 'error'" class="text-sm text-red-500">
    Error Fetching Events... Try again later
  </p>
  <div>
    <label for="EventSearch" class="">Search Events</label>
    <UInputMenu
      v-model="model"
      :disabled="loading"
      placeholder="Search for a event..."
      option-attribute="title"
      :required="true"
      :clearable="false"
      :search="search"
      trailing
      by="id"></UInputMenu>
  </div>
  <p class="text-sm text-green-400">Please select the correct event!</p>
</template>

<script lang="ts" setup>
import type { Event, Profile } from '#shared/types';

const model = defineModel<Event>();
const loading = ref(false);

const { getEvents } = useEvents();

const { data, status } = useAsyncData('searchEvents', async () => {
  const res = await getEvents();
  return res.getOrThrow();
});

function search(query: string) {
  return data.value!.filter((event: Event) =>
    event.title.toLowerCase().includes(query.toLowerCase())
  );
}

watchEffect(() => {
  switch (status.value) {
    case 'pending':
      loading.value = true;
      break;
    case 'success':
      loading.value = false;
      break;
    case 'error':
      loading.value = true;
      break;
    case 'idle':
      loading.value = false;
      break;
  }
});
</script>

<style></style>
