<template>
  <div>
    <label for="UserSearch" class="">Search User</label>
    <UInputMenu
      v-model="model"
      :search="search"
      :loading="loading"
      placeholder="Search for a user..."
      option-attribute="name"
      :required="true"
      :clearable="false"
      trailing
      by="id"></UInputMenu>
  </div>
</template>

<script lang="ts" setup>
import type { Profile } from '#shared/types';

const model = defineModel<Profile>();
const loading = ref(false);
const client = useHttpClient();

async function search(q: string) {
  loading.value = true;
  const res = await client.profile.search.$get({
    query: {
      name: q
    }
  });
  loading.value = false;

  if (!res.ok) return [];

  const usersJson = await res.json();
  return usersJson;
}
</script>

<style></style>
